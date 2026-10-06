#!/usr/bin/env python3
"""验证 Excel 后端 MCP 是否真的可调用。

做法：启动 MCP Server（stdio），发 initialize → notifications/initialized → tools/list，
收到 tools/list 响应即视为可调用，并报出工具数量与名称。

只读：不安装、不改配置。会临时启动一次 MCP Server 进程（退出即回收）。

用法：
    python3 validate.py [--backend file|desktop] [--allow-dir DIR] [--timeout SEC]

退出码：
    0 可调用
    3 不可调用（含平台不支持、命令缺失、握手失败）
"""

from __future__ import annotations

import argparse
import json
import platform
import queue
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

PROTOCOL_VERSION = "2024-11-05"
CLIENT_INFO = {"name": "excel-capability-validate", "version": "1.0"}


def build_command(backend: str, allow_dir: str) -> list[str] | None:
    if backend == "file":
        uvx = shutil.which("uvx")
        if uvx:
            return [uvx, "excel-mcp-server", "stdio", "--allow-dir", allow_dir]
        uv = shutil.which("uv")
        if uv:
            return [uv, "tool", "run", "excel-mcp-server", "stdio", "--allow-dir", allow_dir]
        return None
    if backend == "desktop":
        if platform.system() != "Windows":
            return None
        npx = shutil.which("npx")
        if npx:
            return [npx, "-y", "@sbroenne/mcp-server-excel@latest"]
        return None
    return None


def _reader(stream, sink: "queue.Queue[str | None]") -> None:
    try:
        for line in stream:
            sink.put(line)
    finally:
        sink.put(None)


def handshake(command: list[str], timeout: float) -> dict:
    try:
        proc = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
    except (OSError, FileNotFoundError) as exc:
        return {"ok": False, "error": f"无法启动命令：{exc}"}

    sink: "queue.Queue[str | None]" = queue.Queue()
    threading.Thread(target=_reader, args=(proc.stdout, sink), daemon=True).start()

    def send(obj: dict) -> None:
        assert proc.stdin is not None
        proc.stdin.write(json.dumps(obj) + "\n")
        proc.stdin.flush()

    def wait_for(target_id: int, deadline: float) -> dict | None:
        while True:
            remaining = deadline - time.time()
            if remaining <= 0:
                return None
            try:
                line = sink.get(timeout=min(remaining, 1.0))
            except queue.Empty:
                if proc.poll() is not None:
                    return None
                continue
            if line is None:
                return None
            line = line.strip()
            if not line:
                continue
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(msg, dict) and msg.get("id") == target_id:
                return msg

    try:
        send({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": CLIENT_INFO,
            },
        })
        init = wait_for(1, time.time() + timeout)
        if init is None:
            return {"ok": False, "error": "initialize 无响应（超时或进程已退出）"}
        if "error" in init:
            return {"ok": False, "error": f"initialize 返回错误：{init['error']}"}

        send({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})
        send({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        listed = wait_for(2, time.time() + timeout)
        if listed is None:
            return {"ok": False, "error": "tools/list 无响应（超时）"}
        if "error" in listed:
            return {"ok": False, "error": f"tools/list 返回错误：{listed['error']}"}

        tools = (listed.get("result") or {}).get("tools") or []
        names = [t.get("name") for t in tools if isinstance(t, dict)]
        server = ((init.get("result") or {}).get("serverInfo") or {})
        return {
            "ok": True,
            "server": server.get("name"),
            "server_version": server.get("version"),
            "tool_count": len(names),
            "tools": names,
        }
    finally:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except (subprocess.TimeoutExpired, OSError):
            try:
                proc.kill()
            except OSError:
                pass


def main() -> int:
    parser = argparse.ArgumentParser(description="验证 Excel 后端 MCP 可调用性")
    parser.add_argument("--backend", choices=["file", "desktop"], default="file")
    parser.add_argument("--allow-dir", default=None, help="文件级后端的允许目录（默认临时目录）")
    parser.add_argument("--timeout", type=float, default=120.0, help="单步握手超时（秒），首次拉取包可能较慢")
    args = parser.parse_args()

    allow_dir = args.allow_dir
    temp_dir = None
    if args.backend == "file" and not allow_dir:
        temp_dir = tempfile.mkdtemp(prefix="excel-validate-")
        allow_dir = temp_dir

    command = build_command(args.backend, allow_dir or "")
    if command is None:
        if args.backend == "desktop" and platform.system() != "Windows":
            print(json.dumps({
                "backend": args.backend,
                "callable": False,
                "state": "UNSUPPORTED_PLATFORM",
                "error": "桌面级后端仅支持 Windows；当前系统不可验证",
            }, ensure_ascii=False, indent=2))
            return 3
        print(json.dumps({
            "backend": args.backend,
            "callable": False,
            "state": "COMMAND_MISSING",
            "error": "找不到启动命令（文件级需 uv/uvx，桌面级需 npx）",
        }, ensure_ascii=False, indent=2))
        return 3

    result = handshake(command, args.timeout)
    result["backend"] = args.backend
    result["command"] = command
    result["allow_dir"] = allow_dir
    result["callable"] = bool(result.get("ok"))
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if temp_dir:
        shutil.rmtree(temp_dir, ignore_errors=True)
    return 0 if result.get("callable") else 3


if __name__ == "__main__":
    raise SystemExit(main())
