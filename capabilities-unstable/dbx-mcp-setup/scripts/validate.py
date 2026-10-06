#!/usr/bin/env python3
"""验证 DBX MCP 是否真的可用：可执行文件 + 客户端配置 + 路径一致。

用法：
    python3 validate.py [--client NAME]

退出码：0 可用；1 未通过（逐条列出缺口）。
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check import check_clients, check_desktop, check_mcp  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="验证 DBX MCP 可用性")
    parser.add_argument("--client", help="只检查指定客户端，默认检查全部")
    args = parser.parse_args()

    errors: list[str] = []
    mcp = check_mcp()
    desktop = check_desktop()
    clients = check_clients()

    if not mcp["installed"]:
        errors.append("dbx-mcp 可执行文件不存在")
    elif not os.access(mcp["path"], os.X_OK):
        errors.append(f"dbx-mcp 不可执行：{mcp['path']}")
    elif not mcp["version"]:
        errors.append(f"dbx-mcp --version 无输出：{mcp['path']}")

    targets = [c for c in clients if c["has_dbx"]]
    if args.client:
        targets = [c for c in targets if c["name"] == args.client]
    if not targets:
        errors.append("没有任何 AI 客户端配置了 mcpServers.dbx")
    for client in targets:
        command = client.get("command")
        if not command:
            errors.append(f"{client['name']} 的 dbx 条目缺少 command")
            continue
        if command in {"dbx-mcp", "dbx-mcp-server"} or "~" in command:
            errors.append(
                f"{client['name']} 的 command 是裸命令或含 ~：{command} "
                "——GUI 客户端不一定继承 shell PATH，必须写展开后的绝对路径"
            )
        elif command.startswith("npx"):
            print(f"提示：{client['name']} 仍使用 npx 通道，可迁移到原生绝对路径。")
        elif not Path(command).is_file():
            errors.append(f"{client['name']} 的 command 指向的文件不存在：{command}")

    if not desktop["installed"]:
        print("提示：未检测到 DBX 桌面端，dbx_open_table / dbx_execute_and_show 不可用。")
    elif not desktop["running"]:
        print("提示：DBX 桌面端未运行，需要唤起时请先打开（open 'dbx://open'）。")

    if errors:
        print("DBX MCP 校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"DBX MCP 校验通过：{mcp['path']}（{mcp['channel']}），"
          f"已配置客户端 {', '.join(c['name'] for c in targets)}")
    print("下一步：重启/重载客户端让其发现 MCP，再用只读工具验证 —— "
          "dbx_list_connections → dbx_list_tables → dbx_describe_table")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
