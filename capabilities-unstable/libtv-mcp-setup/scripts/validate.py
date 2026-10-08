#!/usr/bin/env python3
"""校验 LibTV Remote MCP 接入的固定契约与状态。

只读：不握手、不联网、不创建连接器、不改任何配置。
本脚本只做配置常量、配置模式与状态规则校验；连接是否真正就绪以 LibTV 的 doctor 工具为准。

用法：
    python3 validate.py                              # 打印契约 + 状态机 + 下一步
    python3 validate.py --state READY                # 校验状态枚举，输出裁决
    python3 validate.py --name LibTV-wuch --url https://mcp.liblib.tv/mcp
    python3 validate.py --config ~/.cursor/mcp.json  # 查找 LibTV 条目并判断模式：bridge / direct-url / not-found

退出码：
    0 校验通过（无状态参数，或状态为 READY）
    3 校验失败（名称/地址不符、状态非法，或状态非 READY）
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

CONNECTOR_NAME = "LibTV-wuch"
MCP_URL = "https://mcp.liblib.tv/mcp"
PROVIDER = "LibTV"

RECOMMENDED_ENTRY = {
    "command": "npx",
    "args": ["-y", "mcp-remote@latest", MCP_URL],
}

STATES = {
    "NOT_FOUND": "配置中没有 LibTV-wuch",
    "CONNECTED_UNAUTHORIZED": "配置存在，等待 LibTV 账户授权",
    "READY": "工具已加载，doctor 返回 status: ready 且带 identity",
    "ERROR": "连接失败",
}

NEXT_ACTION = {
    "NOT_FOUND": "只增补 mcpServers.LibTV-wuch 为推荐桥接配置，保留其他条目；重载后交给用户授权",
    "CONNECTED_UNAUTHORIZED": "不重复创建；让用户在自动弹出的浏览器页登录并授权（或发日志中的授权链接），完成后调用 doctor 复查",
    "READY": "结束接入，进入用户的影像创作任务",
    "ERROR": "不宣称已连接；读 mcp-server-user-LibTV-wuch.log 定位，按 method.md 排错表修复后复查，不动其他 MCP",
}

ALIASES = {"UNAUTHORIZED": "CONNECTED_UNAUTHORIZED", "CONNECTED": "READY"}

READY_CONDITIONS = [
    "连接器 LibTV-wuch 存在",
    f"MCP 地址为 {MCP_URL}（推荐经 mcp-remote 桥接）",
    "LibTV-wuch 工具列表已加载",
    "doctor 返回 status: ready 且带 identity",
]


def canonical(state: str) -> str:
    s = state.strip().upper()
    return ALIASES.get(s, s)


def find_in_config(path: Path) -> dict:
    if not path.is_file():
        return {"config": str(path), "exists": False, "found": False, "entry": None}
    text = path.read_text(encoding="utf-8", errors="ignore")
    if path.suffix == ".toml":
        found = (CONNECTOR_NAME in text) or (MCP_URL in text)
        return {"config": str(path), "exists": True, "found": found, "entry": None}
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {"config": str(path), "exists": True, "found": False, "entry": None,
                "error": "JSON 解析失败"}
    candidates = []
    for key in ("mcpServers", "servers"):
        block = data.get(key)
        if isinstance(block, dict):
            candidates.append(block)
    mcp = data.get("mcp")
    if isinstance(mcp, dict) and isinstance(mcp.get("servers"), dict):
        candidates.append(mcp["servers"])
    for block in candidates:
        for name, entry in block.items():
            blob = json.dumps(entry, ensure_ascii=False) if isinstance(entry, (dict, list)) else str(entry)
            if name == CONNECTOR_NAME or MCP_URL in blob or "liblib" in blob.lower():
                mode, advice = config_mode(entry)
                return {"config": str(path), "exists": True, "found": True,
                        "name_ok": name == CONNECTOR_NAME, "mode": mode, "advice": advice,
                        "entry": {"name": name, "value": redact_secrets(entry)}}
    return {"config": str(path), "exists": True, "found": False, "mode": "not-found",
            "advice": "写入推荐桥接配置", "entry": None}


def config_mode(entry) -> tuple[str, str]:
    if not isinstance(entry, dict):
        return "unknown", "条目格式异常，按推荐桥接配置重写"
    args = entry.get("args") or []
    url = str(entry.get("url") or entry.get("serverUrl") or "")
    if any("mcp-remote" in str(a) for a in args):
        if any(str(a).rstrip("/") == MCP_URL for a in args):
            return "bridge", "配置正确；授权后调用 doctor 复查"
        return "bridge-wrong-url", f"桥接地址应为 {MCP_URL}"
    if url:
        if url.rstrip("/") != MCP_URL:
            return "direct-url-wrong", f"地址应为 {MCP_URL}，并改为桥接配置"
        return "direct-url", "直连 url 在 Cursor 等自定义协议回调客户端会报 redirect URI is not allowed，改为桥接配置"
    return "unknown", "未识别的配置形态，按推荐桥接配置重写"


def redact_secrets(value):
    """Redact likely credentials before including a config entry in stdout."""
    secret_words = ("token", "secret", "password", "credential", "authorization", "api_key", "apikey")
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if any(word in str(key).lower().replace("-", "_") for word in secret_words):
                result[key] = "<redacted>"
            else:
                result[key] = redact_secrets(item)
        return result
    if isinstance(value, list):
        return [redact_secrets(item) for item in value]
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description="校验 LibTV Remote MCP 接入契约与状态")
    parser.add_argument("--state", default=None, help="待校验的状态枚举")
    parser.add_argument("--name", default=None, help="待校验的连接器名")
    parser.add_argument("--url", default=None, help="待校验的 MCP 地址")
    parser.add_argument("--config", default=None, help="在客户端配置文件中查找 LibTV 条目")
    args = parser.parse_args()

    contract = {"connector_name": CONNECTOR_NAME, "mcp_url": MCP_URL, "provider": PROVIDER}
    errors: list[str] = []

    if args.name is not None and args.name != CONNECTOR_NAME:
        errors.append(f"连接器名不符：期望 {CONNECTOR_NAME}，实际 {args.name}")
    if args.url is not None and args.url.rstrip("/") != MCP_URL.rstrip("/"):
        errors.append(f"MCP 地址不符：期望 {MCP_URL}，实际 {args.url}")

    state = None
    if args.state is not None:
        state = canonical(args.state)
        if state not in STATES:
            errors.append(f"非法状态：{args.state}（合法：{' / '.join(STATES)}）")

    config = find_in_config(Path(args.config).expanduser()) if args.config else None

    if state is not None and state in STATES:
        verdict = state
        next_action = NEXT_ACTION[state]
    elif errors:
        verdict = "INVALID"
        next_action = "修正名称/地址/状态后重试"
    else:
        verdict = None
        next_action = None

    payload = {
        "capability": "libtv-mcp-setup",
        "contract": contract,
        "recommended_entry": {CONNECTOR_NAME: RECOMMENDED_ENTRY},
        "ready_conditions": READY_CONDITIONS,
        "states": STATES,
        "checked": {"state": state, "name": args.name, "url": args.url},
        "config_scan": config,
        "verdict": verdict,
        "ready": verdict == "READY",
        "next_action": next_action,
        "errors": errors,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))

    if errors:
        return 3
    if state is not None and state != "READY":
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
