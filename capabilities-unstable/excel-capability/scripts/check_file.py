#!/usr/bin/env python3
"""检测文件级 Excel 后端（haris-musa/excel-mcp-server）可用性。

只读：不安装、不联网、不改任何配置文件。

用法：
    python3 check_file.py [--json]

状态机（payload 的 state 字段）：
    READY               uvx 可用 + 至少一个客户端已配置
    MCP_NOT_CONFIGURED  uvx 可用，客户端没配
    UV_MISSING          无 uv / uvx
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

# (名称, 配置路径模板, 类型)。~ 会展开；项目级用相对路径。
CLIENTS = [
    ("workbuddy", "~/.workbuddy-ai/mcp.json", "json"),
    ("cursor", "~/.cursor/mcp.json", "json"),
    ("claude-code", ".mcp.json", "json"),
    ("claude-code-user", "~/.claude.json", "json"),
    ("windsurf", "~/.codeium/windsurf/mcp_config.json", "json"),
    ("codex", "~/.codex/config.toml", "toml"),
    ("vscode", "~/Library/Application Support/Code/User/settings.json", "json-vscode"),
]

KEY = "excel"
MARKER = "excel-mcp-server"


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def server_entries(path: Path, kind: str) -> dict:
    if kind == "json":
        servers = read_json(path).get("mcpServers") or {}
    elif kind == "json-vscode":
        servers = (read_json(path).get("mcp") or {}).get("servers") or {}
    else:
        servers = {}
    return servers if isinstance(servers, dict) else {}


def entry_matches(entry: object) -> bool:
    if not isinstance(entry, dict):
        return False
    parts = [str(entry.get("command") or "")]
    parts += [str(a) for a in (entry.get("args") or [])]
    return MARKER in " ".join(parts)


def is_configured(path: Path, kind: str) -> bool:
    if kind == "toml":
        text = path.read_text(encoding="utf-8", errors="ignore")
        return KEY in text and MARKER in text
    entries = server_entries(path, kind)
    if isinstance(entries.get(KEY), dict):
        return True
    return any(entry_matches(e) for e in entries.values())


def check_uv() -> dict:
    uvx = shutil.which("uvx")
    uv = shutil.which("uv")
    return {"installed": bool(uvx or uv), "uv": uv, "uvx": uvx}


def check_clients() -> list[dict]:
    result = []
    for name, raw, kind in CLIENTS:
        path = Path(raw).expanduser()
        if not path.is_file():
            result.append({"name": name, "config": str(path), "exists": False, "configured": False})
            continue
        result.append({
            "name": name,
            "config": str(path),
            "exists": True,
            "configured": is_configured(path, kind),
        })
    return result


def decide(uv: dict, clients: list[dict]) -> tuple[str, str, list[str]]:
    configured = [c["name"] for c in clients if c["configured"]]
    if not uv["installed"]:
        return "UV_MISSING", "先安装 uv（含 uvx）：brew install uv，或 curl -LsSf https://astral.sh/uv/install.sh | sh", []
    if configured:
        return "READY", "直接用文件级 Excel MCP 工具：list_workbooks → describe_workbook → read_range", configured
    return "MCP_NOT_CONFIGURED", "把 excel MCP 写进当前客户端配置的 mcpServers.excel（只新增这一个键）", []


def main() -> int:
    parser = argparse.ArgumentParser(description="检测文件级 Excel 后端")
    parser.add_argument("--json", action="store_true", help="仅输出 JSON（默认也输出 JSON）")
    parser.parse_args()

    uv = check_uv()
    clients = check_clients()
    state, next_action, configured = decide(uv, clients)

    snippet = None
    if uv["installed"]:
        snippet = {
            "mcpServers": {
                "excel": {
                    "command": uv["uvx"] or "uvx",
                    "args": ["excel-mcp-server", "stdio", "--allow-dir", "/path/to/workbooks"],
                }
            }
        }

    payload = {
        "backend": "file",
        "platform": sys.platform,
        "state": state,
        "ready": state == "READY",
        "next_action": next_action,
        "configured_clients": configured,
        "uv": uv,
        "clients": clients,
        "config_snippet": snippet,
        "notes": [
            "文件级后端基于 openpyxl，不需要 Microsoft Excel，跨平台可用",
            "GUI 客户端不一定继承 shell PATH，配置里的 command 应写展开后的绝对路径",
            "公式只存储不计算；不支持 .xls/.csv 与真实 PivotTable",
        ],
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
