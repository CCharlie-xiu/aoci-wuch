#!/usr/bin/env python3
"""检测桌面级 Excel 后端（sbroenne/mcp-server-excel / ExcelMcp）三态。

只读：不安装、不改配置。

用法：
    python3 check_desktop.py [--json]

状态机（payload 的 state 字段）：
    READY                 Windows + Excel + MCP + 客户端已配
    MCP_NOT_CONFIGURED    MCP 已装，客户端没配
    MCP_MISSING           Windows + Excel，无 MCP
    EXCEL_MISSING         Windows，无 Excel
    UNSUPPORTED_PLATFORM  非 Windows（桌面后端不可用）
"""

from __future__ import annotations

import argparse
import glob
import json
import platform
import shutil
import subprocess
import sys
from pathlib import Path

CLIENTS = [
    ("workbuddy", "~/.workbuddy-ai/mcp.json", "json"),
    ("cursor", "~/.cursor/mcp.json", "json"),
    ("claude-code", ".mcp.json", "json"),
    ("claude-code-user", "~/.claude.json", "json"),
    ("windsurf", "~/.codeium/windsurf/mcp_config.json", "json"),
    ("codex", "~/.codex/config.toml", "toml"),
    ("vscode", "~/Library/Application Support/Code/User/settings.json", "json-vscode"),
]

KEY = "excel-mcp"
MARKERS = ("@sbroenne/mcp-server-excel", "mcp-excel", "excelcli")

EXCEL_PATHS = [
    r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE",
    r"C:\Program Files (x86)\Microsoft Office\root\Office16\EXCEL.EXE",
    r"C:\Program Files\Microsoft Office\Office16\EXCEL.EXE",
    r"C:\Program Files (x86)\Microsoft Office\Office16\EXCEL.EXE",
]


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
    blob = " ".join(parts)
    return any(m in blob for m in MARKERS)


def is_configured(path: Path, kind: str) -> bool:
    if kind == "toml":
        text = path.read_text(encoding="utf-8", errors="ignore")
        return KEY in text or any(m in text for m in MARKERS)
    entries = server_entries(path, kind)
    if isinstance(entries.get(KEY), dict):
        return True
    return any(entry_matches(e) for e in entries.values())


def check_os() -> str:
    return platform.system()


def check_excel() -> dict:
    if platform.system() != "Windows":
        return {"installed": False, "path": None, "reason": "非 Windows"}
    for raw in EXCEL_PATHS:
        if Path(raw).is_file():
            return {"installed": True, "path": raw, "reason": None}
    try:
        completed = subprocess.run(
            ["reg", "query", r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\excel.exe", "/ve"],
            capture_output=True, text=True, timeout=10,
        )
        if completed.returncode == 0 and "EXCEL.EXE" in completed.stdout.upper():
            return {"installed": True, "path": "registry:App Paths", "reason": None}
    except (OSError, subprocess.SubprocessError):
        pass
    return {"installed": False, "path": None, "reason": "未在常见路径或注册表找到 EXCEL.EXE"}


def check_mcp() -> dict:
    if platform.system() != "Windows":
        return {"installed": False, "channel": None, "path": None}
    for name in ("excelcli", "mcp-excel"):
        found = shutil.which(name)
        if found:
            return {"installed": True, "channel": name, "path": found}
    for pattern in ("~/.vscode/extensions/sbroenne.excel-mcp-*", "~/.vscode-insiders/extensions/sbroenne.excel-mcp-*"):
        hits = sorted(glob.glob(str(Path(pattern).expanduser())))
        if hits:
            return {"installed": True, "channel": "vscode-extension", "path": hits[-1]}
    return {"installed": False, "channel": None, "path": None}


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


def decide(os_name: str, excel: dict, mcp: dict, clients: list[dict]) -> tuple[str, str]:
    if os_name != "Windows":
        return "UNSUPPORTED_PLATFORM", "桌面级后端仅支持 Windows 10+；当前系统请改用文件级后端"
    if not excel["installed"]:
        return "EXCEL_MISSING", "需要 Microsoft Excel 2016+ 桌面版；先安装 Excel 再装 ExcelMcp"
    if not mcp["installed"]:
        return "MCP_MISSING", "装 ExcelMcp：VS Code 扩展 sbroenne.excel-mcp，或 npx -y @sbroenne/mcp-server-excel@latest"
    if not any(c["configured"] for c in clients):
        return "MCP_NOT_CONFIGURED", "把 excel-mcp 写进当前客户端配置的 mcpServers.excel-mcp"
    return "READY", "直接用桌面级 Excel MCP 工具（操作前关闭已打开的工作簿）"


def main() -> int:
    parser = argparse.ArgumentParser(description="检测桌面级 Excel 后端")
    parser.add_argument("--json", action="store_true", help="仅输出 JSON（默认也输出 JSON）")
    parser.parse_args()

    os_name = check_os()
    excel = check_excel()
    mcp = check_mcp()
    clients = check_clients()
    state, next_action = decide(os_name, excel, mcp, clients)

    payload = {
        "backend": "desktop",
        "platform": os_name,
        "state": state,
        "ready": state == "READY",
        "next_action": next_action,
        "os": os_name,
        "excel": excel,
        "excel_mcp": mcp,
        "clients": clients,
        "config_snippet": {
            "mcpServers": {
                "excel-mcp": {
                    "command": "npx",
                    "args": ["-y", "@sbroenne/mcp-server-excel@latest"],
                }
            }
        },
        "notes": [
            "桌面级后端仅支持 Windows 10+ / Excel 2016+ / 交互桌面",
            "ExcelMcp 需要工作簿独占访问，操作前须关闭已打开的工作簿",
            "非 Windows 环境一律不可用，不要伪造可用状态",
        ],
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
