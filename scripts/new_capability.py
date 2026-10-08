#!/usr/bin/env python3
"""Scaffold a new capability in capabilities-unstable/ (public or [PRO])."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUCKET = "capabilities-unstable"
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
TAG = re.compile(r"^[OSTKMZ][ADIMFWO][1-9][ED][LMH]$")

TEMPLATE = """# {name}

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`{name}[{tag}]{pro}`

F: {desc}
R:
A:
S:

---

## 这是什么

## 什么时候用

## 怎么用

## 最不能违反什么
"""


def append_index_line(index_path: Path, line: str) -> None:
    lines = index_path.read_text(encoding="utf-8").splitlines()
    fences = [i for i, text in enumerate(lines) if text.strip() == "```"]
    if not fences:
        raise SystemExit(f"无法在 {index_path.relative_to(ROOT)} 中找到能力列表代码块")
    lines.insert(fences[-1], line)
    index_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="新建待验证能力（默认公开，--pro 为订阅能力）")
    parser.add_argument("name", help="能力名，小写连字符，如 pdf-to-md")
    parser.add_argument("--tag", required=True, help="五位标签，成熟度只能是 E/D，如 TF8DH")
    parser.add_argument("--desc", required=True, help="一句话核心职责（同时写入 F 与索引行）")
    parser.add_argument("--pro", action="store_true", help="订阅能力：正文写入私有仓库 capabilities-pro/")
    args = parser.parse_args()

    if not NAME.fullmatch(args.name):
        print(f"能力名不合法：{args.name}（只允许小写字母、数字和连字符）", file=sys.stderr)
        return 1
    if not TAG.fullmatch(args.tag):
        print(f"标签不合法：{args.tag}（格式见 _meta/taxonomy.md，新能力成熟度只能是 E 或 D）", file=sys.stderr)
        return 1

    index_path = ROOT / BUCKET / "index.md"
    if re.search(rf"^{re.escape(args.name)}\[", index_path.read_text(encoding="utf-8"), re.M):
        print(f"{BUCKET}/index.md 已存在同名条目：{args.name}", file=sys.stderr)
        return 1
    for bucket in ("capabilities", "capabilities-unstable", "capabilities-retired"):
        for base in (ROOT, ROOT / "capabilities-pro"):
            if (base / bucket / args.name).exists():
                print(f"已存在同名能力目录：{(base / bucket / args.name).relative_to(ROOT)}", file=sys.stderr)
                return 1

    if args.pro:
        pro_root = ROOT / "capabilities-pro"
        if not (pro_root / ".git").exists():
            print(
                "本机没有私有仓库 capabilities-pro/，先执行：\n"
                "  git clone https://github.com/CCharlie-xiu/aoci-wuch-pro.git capabilities-pro",
                file=sys.stderr,
            )
            return 1
        target = pro_root / BUCKET / args.name
    else:
        target = ROOT / BUCKET / args.name

    pro_flag = "[PRO]" if args.pro else ""
    target.mkdir(parents=True)
    (target / "index.md").write_text(
        TEMPLATE.format(name=args.name, tag=args.tag, pro=pro_flag, desc=args.desc),
        encoding="utf-8",
    )
    append_index_line(index_path, f"{args.name}[{args.tag}]{pro_flag}: {args.desc}")

    print(f"已创建 {target.relative_to(ROOT)}/index.md")
    print(f"已在 {BUCKET}/index.md 追加索引行")
    print("\n补全 FRAS 与正文后，运行 python3 scripts/validate.py，再提交：")
    if args.pro:
        print(f"  1. 私有仓库：cd capabilities-pro && git add {BUCKET}/{args.name} && git commit && git push")
        print(f"  2. 公开仓库：git add {BUCKET}/index.md && git commit && git push")
        print("  顺序不能反：先推正文，再公开索引，避免出现无正文的 [PRO] 条目。")
    else:
        print(f"  git add {BUCKET}/{args.name} {BUCKET}/index.md && git commit && git push")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
