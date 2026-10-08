#!/usr/bin/env python3
"""Scaffold a new capability in the private incubator capabilities-pro/capabilities-unstable/."""

from __future__ import annotations

import argparse
import re
import sys

from catalog_lib import INCUBATOR, NAME, ROOT, append_index_line, name_taken, require_pro_clone


TAG = re.compile(r"^[OSTKMZ][ADIMFWO][1-9][ED][LMH]$")

TEMPLATE = """# {name}

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`{name}[{tag}]`

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


def main() -> int:
    parser = argparse.ArgumentParser(description="在私有孵化区新建能力（不公开、不进首页与 README）")
    parser.add_argument("name", help="能力名，小写连字符，如 pdf-to-md")
    parser.add_argument("--tag", required=True, help="五位标签，成熟度只能是 E/D，如 TF8DH")
    parser.add_argument("--desc", required=True, help="一句话核心职责（同时写入 F 与索引行）")
    args = parser.parse_args()

    if not NAME.fullmatch(args.name):
        print(f"能力名不合法：{args.name}（只允许小写字母、数字和连字符）", file=sys.stderr)
        return 1
    if not TAG.fullmatch(args.tag):
        print(f"标签不合法：{args.tag}（格式见 _meta/taxonomy.md，新能力成熟度只能是 E 或 D）", file=sys.stderr)
        return 1
    require_pro_clone()
    if taken := name_taken(args.name):
        print(f"已存在同名能力目录：{taken.relative_to(ROOT)}", file=sys.stderr)
        return 1

    target = INCUBATOR / args.name
    target.mkdir(parents=True)
    (target / "index.md").write_text(TEMPLATE.format(name=args.name, tag=args.tag, desc=args.desc), encoding="utf-8")
    append_index_line(INCUBATOR / "index.md", f"{args.name}[{args.tag}]: {args.desc}")

    print(f"已创建 {target.relative_to(ROOT)}/index.md（私有孵化区，公开处不可见）")
    print("已登记到私有索引 capabilities-pro/capabilities-unstable/index.md")
    print("\n补全 FRAS 与正文后：")
    print("  python3 scripts/validate.py")
    print(f"  cd capabilities-pro && git add capabilities-unstable && git commit -m '孵化 {args.name}' && git push")
    print("\n验证通过后发布：python3 scripts/release_capability.py <name> --free|--pro --title ...")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
