#!/usr/bin/env python3
"""Release a validated capability as a stable free (public) or [PRO] (subscription) capability."""

from __future__ import annotations

import argparse
import re
import shutil
import sys

from catalog_lib import (
    INCUBATOR,
    PRO_ROOT,
    ROOT,
    add_readme_row,
    append_index_line,
    find_entry,
    remove_index_line,
    remove_readme_row,
    require_pro_clone,
    set_homepage_entry,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="发布能力为正式能力：--free 公开免费，--pro 订阅。必须先经人确认。")
    parser.add_argument("name")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--free", action="store_true", help="公开免费：正文进入公开仓库 capabilities/（不可撤回）")
    mode.add_argument("--pro", action="store_true", help="订阅：正文进入 capabilities-pro/capabilities/，公开索引带 [PRO]")
    parser.add_argument("--maturity", choices=["S", "M"], default="S", help="发布后的成熟度，默认 S")
    parser.add_argument("--title", required=True, help="首页与 README 显示的中文名")
    parser.add_argument("--title-en", help="首页英文名；首页已有该能力时默认保留原值，否则同能力名")
    parser.add_argument("--icon", help="首页图标（lucide 图标名）；首页已有时默认保留原值，否则 sparkles")
    args = parser.parse_args()
    require_pro_clone()

    sources = [
        (INCUBATOR / args.name, INCUBATOR / "index.md", "私有孵化区"),
        (ROOT / "capabilities-unstable" / args.name, ROOT / "capabilities-unstable" / "index.md", "公开待验证区"),
    ]
    found = [(d, i, label) for d, i, label in sources if d.is_dir() and find_entry(i, args.name)]
    if not found:
        print(f"找不到待发布的能力 {args.name}（需在孵化区或公开待验证区，且已登记索引）", file=sys.stderr)
        return 1
    src_dir, src_index, src_label = found[0]
    old_tag, _, desc = find_entry(src_index, args.name)
    new_tag = old_tag[:3] + args.maturity + old_tag[4]
    pro_flag = "[PRO]" if args.pro else ""

    if args.free and src_label == "私有孵化区":
        print("注意：发布为免费后，正文将永久进入公开仓库历史。")
    if args.pro and src_label == "公开待验证区":
        print("注意：该能力已在公开历史中，转为订阅只对今后的版本生效。")

    target = (PRO_ROOT if args.pro else ROOT) / "capabilities" / args.name
    if target.exists():
        print(f"目标已存在：{target.relative_to(ROOT)}", file=sys.stderr)
        return 1
    shutil.move(str(src_dir), str(target))

    capability_index = target / "index.md"
    text = capability_index.read_text(encoding="utf-8")
    text = re.sub(rf"^`{re.escape(args.name)}\[[A-Z0-9]{{5}}\](\[PRO\])?`$", f"`{args.name}[{new_tag}]{pro_flag}`", text, count=1, flags=re.M)
    capability_index.write_text(text, encoding="utf-8")

    remove_index_line(src_index, args.name)
    append_index_line(ROOT / "capabilities" / "index.md", f"{args.name}[{new_tag}]{pro_flag}: {desc}")
    set_homepage_entry(args.name, args.title, args.title_en, args.icon, args.pro)
    remove_readme_row(args.name)
    add_readme_row("capabilities", args.name, args.title, desc, args.pro)

    print(f"已发布 {args.name}[{new_tag}]{pro_flag}：{src_label} → {target.relative_to(ROOT)}")
    print("已更新公开索引 capabilities/index.md、首页 index.html、README")
    print("\n运行 python3 scripts/validate.py 后提交（先私有、后公开）：")
    print("  1. cd capabilities-pro && git add -A && git commit -m '发布 ...' && git push && cd ..")
    print("  2. git add -A && git commit -m '发布 ...' && git push")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
