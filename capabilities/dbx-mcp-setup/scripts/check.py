#!/usr/bin/env python3
"""检测 DBX / DBX MCP / AI 客户端配置三处状态。

只读：不安装、不联网、不改任何配置文件。

用法：
    python3 check.py [--json]

输出状态机位置：
    READY              MCP 已装 + 至少一个客户端已配置
    MCP_NOT_CONFIGURED MCP 已装，客户端没配
    MCP_MISSING        DBX 在，MCP 没装
    DBX_MISSING        DBX 本体都没有
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HOME = Path.home()

# (名称, 配置路径模板, 类型)。路径里的 ~ 会展开；项目级用相对路径。
CLIENTS = [
    ("workbuddy", "~/.workbuddy-ai/mcp.json", "json"),
    ("cursor", "~/.cursor/mcp.json", "json"),
    ("claude-code", ".mcp.json", "json"),
    ("claude-code-user", "~/.claude.json", "json"),
    ("windsurf", "~/.codeium/windsurf/mcp_config.json", "json"),
    ("codex", "~/.codex/config.toml", "toml"),
    ("vscode", "~/Library/Application Support/Code/User/settings.json", "json-vscode"),
    ("dsh", None, "yaml"),
]

DESKTOP_CANDIDATES = [
    "/Applications/DBX.app",
    "~/Applications/DBX.app",
    "C:/Program Files/DBX/DBX.exe",
]

MCP_CANDIDATES = [
    ("native", "~/.dbx/bin/dbx-mcp"),
    ("brew", None),   # 运行时用 brew --prefix 求
    ("npm", None),    # 运行时用 which dbx-mcp-server
]


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, capture_output=True, text=True)


def expand(raw: str | None) -> Path | None:
    return Path(raw).expanduser() if raw else None


def check_desktop() -> dict:
    for raw in DESKTOP_CANDIDATES:
        path = expand(raw)
        if path and path.exists():
            running = run(["pgrep", "-x", "DBX"]).returncode == 0
            return {"installed": True, "path": str(path), "running": running}
    return {"installed": False, "path": None, "running": False}


def check_cli() -> dict:
    path = shutil.which("dbx")
    if not path:
        return {"installed": False, "path": None, "version": None}
    completed = run(["dbx", "--version"])
    version = completed.stdout.strip() if completed.returncode == 0 else None
    return {"installed": True, "path": path, "version": version}


def probe_version(path: Path) -> str | None:
    completed = run([str(path), "--version"])
    if completed.returncode == 0 and completed.stdout.strip():
        return completed.stdout.strip().splitlines()[0]
    marker = path.parent / ".dbx-mcp-version"
    return marker.read_text(encoding="utf-8").strip() if marker.is_file() else None


def check_mcp() -> dict:
    native = expand("~/.dbx/bin/dbx-mcp")
    if native and native.is_file():
        return {"installed": True, "path": str(native), "channel": "native",
                "version": probe_version(native)}
    brew = shutil.which("brew")
    if brew:
        prefix = run([brew, "--prefix"]).stdout.strip()
        if prefix:
            candidate = Path(prefix) / "bin" / "dbx-mcp"
            if candidate.is_file():
                return {"installed": True, "path": str(candidate), "channel": "brew",
                        "version": probe_version(candidate)}
    for name in ("dbx-mcp", "dbx-mcp-server"):
        found = shutil.which(name)
        if found:
            return {"installed": True, "path": found, "channel": "npm",
                    "version": probe_version(Path(found))}
    return {"installed": False, "path": None, "channel": None, "version": None}


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def find_dbx_entry(path: Path, kind: str) -> dict | None:
    if kind == "json":
        servers = read_json(path).get("mcpServers") or {}
        entry = servers.get("dbx")
        return entry if isinstance(entry, dict) else None
    if kind == "json-vscode":
        servers = (read_json(path).get("mcp") or {}).get("servers") or {}
        entry = servers.get("dbx")
        return entry if isinstance(entry, dict) else None
    text = path.read_text(encoding="utf-8", errors="ignore")
    if kind == "toml":
        return {"raw": True} if "[mcp_servers.dbx]" in text else None
    if kind == "yaml":
        return {"raw": True} if "serverName: dbx" in text else None
    return None


def dsh_paths() -> list[Path]:
    base = Path(os.environ.get("DSH_HOME") or "~/.dsh").expanduser()
    if not base.is_dir():
        return []
    return sorted((base / "profiles").glob("*/cordis.patch.yml"))


def check_clients() -> list[dict]:
    result = []
    for name, raw, kind in CLIENTS:
        if kind == "yaml":
            for path in dsh_paths():
                entry = find_dbx_entry(path, kind)
                result.append({
                    "name": f"dsh:{path.parent.name}",
                    "config": str(path),
                    "exists": True,
                    "has_dbx": entry is not None,
                    "command": None,
                })
            continue
        path = expand(raw)
        if path is None:
            continue
        exists = path.is_file()
        entry = find_dbx_entry(path, kind) if exists else None
        result.append({
            "name": name,
            "config": str(path),
            "exists": exists,
            "has_dbx": entry is not None,
            "command": (entry or {}).get("command") if isinstance(entry, dict) else None,
        })
    return result


def decide(desktop: dict, cli: dict, mcp: dict, clients: list[dict]) -> tuple[str, str]:
    configured = [c for c in clients if c["has_dbx"]]
    if mcp["installed"] and configured:
        return "READY", "直接用 DBX MCP 工具：dbx_list_connections → dbx_list_tables → dbx_describe_table"
    if mcp["installed"]:
        return ("MCP_NOT_CONFIGURED",
                "把 MCP 绝对路径写进当前客户端配置的 mcpServers.dbx（只新增这一个键）")
    if desktop["installed"] or cli["installed"]:
        return "MCP_MISSING", "执行官方安装命令装 DBX MCP：python3 scripts/install.py --confirm"
    return "DBX_MISSING", "先装 DBX（桌面端或 CLI），再装 MCP；需用户确认"


def main() -> int:
    parser = argparse.ArgumentParser(description="检测 DBX MCP 环境")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    desktop = check_desktop()
    cli = check_cli()
    mcp = check_mcp()
    clients = check_clients()
    state, next_action = decide(desktop, cli, mcp, clients)

    absolute = mcp["path"]
    snippet = None
    if mcp["installed"]:
        snippet = {"mcpServers": {"dbx": {"command": absolute, "args": []}}}
    payload = {
        "platform": sys.platform,
        "state": state,
        "ready": state == "READY",
        "next_action": next_action,
        "dbx_desktop": desktop,
        "dbx_cli": cli,
        "dbx_mcp": mcp,
        "clients": clients,
        "config_snippet": snippet,
        "notes": [
            "三者独立：DBX 已装 ≠ MCP 已装 ≠ 当前客户端已加载",
            "GUI 客户端不一定继承 shell PATH，必须写展开后的绝对路径",
            "dbx_open_table / dbx_execute_and_show 要求 DBX 桌面端正在运行",
        ],
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
