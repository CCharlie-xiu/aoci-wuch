#!/usr/bin/env python3
"""调用 DBX 官方安装命令安装 DBX MCP（或 CLI）。

不重新实现安装逻辑，只编排官方命令。
远端脚本属于高风险动作：默认只打印，必须显式 --confirm 才执行。

用法：
    python3 install.py                        # 打印将执行的命令
    python3 install.py --confirm              # 真正安装 MCP（原生通道）
    python3 install.py --confirm --channel brew
    python3 install.py --confirm --cli        # 顺便装 DBX CLI
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

COMMANDS = {
    "native": ["sh", "-c", "curl -fsSL https://dbxio.com/install-mcp | sh"],
    "brew": ["brew", "install", "t8y2/tap/dbx-mcp"],
    "npm": ["npm", "install", "-g", "@dbx-app/mcp-server"],
}

CLI_COMMANDS = {
    "npm": ["npm", "install", "-g", "@dbx-app/cli"],
    "brew": ["brew", "install", "dbx-cli"],
}


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, capture_output=True, text=True)


def locate_mcp() -> tuple[str | None, str | None]:
    """返回 (绝对路径, 通道)。"""
    native = Path("~/.dbx/bin/dbx-mcp").expanduser()
    if native.is_file():
        return str(native), "native"
    brew = shutil.which("brew")
    if brew:
        prefix = run([brew, "--prefix"]).stdout.strip()
        if prefix:
            candidate = Path(prefix) / "bin" / "dbx-mcp"
            if candidate.is_file():
                return str(candidate), "brew"
    for name in ("dbx-mcp", "dbx-mcp-server"):
        found = shutil.which(name)
        if found:
            return found, "npm"
    return None, None


def report_stage(label: str, command: list[str], confirm: bool) -> bool:
    printable = " ".join(command)
    print(f"{label}：{printable}")
    if not confirm:
        print("  （未执行：需要 --confirm）")
        return False
    completed = run(command)
    if completed.returncode != 0:
        print(f"  失败：{completed.stderr.strip()[-400:] or completed.stdout.strip()[-400:]}",
              file=sys.stderr)
        return False
    print("  完成")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="安装 DBX MCP / CLI")
    parser.add_argument("--channel", default="native", choices=list(COMMANDS))
    parser.add_argument("--cli", action="store_true", help="同时安装 DBX CLI")
    parser.add_argument("--confirm", action="store_true", help="真正执行")
    args = parser.parse_args()

    ok = report_stage("安装 DBX MCP", COMMANDS[args.channel], args.confirm)
    if args.cli:
        channel = "brew" if args.channel == "brew" else "npm"
        report_stage("安装 DBX CLI", CLI_COMMANDS[channel], args.confirm)

    path, channel = locate_mcp()
    if args.confirm and not path:
        print("未找到 dbx-mcp 可执行文件，请检查安装输出。", file=sys.stderr)
        return 1
    if path:
        print(f"\n可执行文件绝对路径（写进客户端配置）：{path}")
        print(f"通道：{channel}")
        print("不要写 ~ 或裸命令 dbx-mcp —— GUI 客户端不一定继承 shell PATH。")
    return 0 if (ok or not args.confirm) else 1


if __name__ == "__main__":
    raise SystemExit(main())
