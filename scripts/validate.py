#!/usr/bin/env python3
"""Validate capability index entries against the repository's directory layout."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUCKETS = {
    "capabilities": {"S", "M"},
    "capabilities-unstable": {"E", "D"},
    "capabilities-retired": {"E", "D", "S", "M"},
}
ENTRY = re.compile(
    r"^([a-z0-9]+(?:-[a-z0-9]+)*)\[([A-Z]{2}[1-9][A-Z]{2})\]:\s+(.+?)\s*$"
)
TYPES = set("OSTKMZ")
DOMAINS = set("ADIMFWO")
MATURITIES = set("EDSM")
PRIORITIES = set("LMH")


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []

    for bucket, allowed_maturities in BUCKETS.items():
        bucket_path = ROOT / bucket
        index_path = bucket_path / "index.md"
        if not index_path.is_file():
            fail(f"缺少索引文件：{index_path.relative_to(ROOT)}", errors)
            continue

        entries: dict[str, tuple[str, int]] = {}
        for line_number, line in enumerate(
            index_path.read_text(encoding="utf-8").splitlines(), start=1
        ):
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or stripped.startswith("`"):
                continue
            if stripped.startswith("name[tag]:"):
                continue
            if "[" not in stripped:
                continue
            match = ENTRY.fullmatch(stripped)
            if not match:
                fail(
                    f"{index_path.relative_to(ROOT)}:{line_number}: 索引行格式错误：{stripped}",
                    errors,
                )
                continue

            name, tag, _description = match.groups()
            if name in entries:
                fail(f"{index_path.relative_to(ROOT)}: 重复条目 {name}", errors)
            else:
                entries[name] = (tag, line_number)

            if tag[0] not in TYPES:
                fail(f"{index_path.relative_to(ROOT)}:{line_number}: 未知 Type：{tag[0]}", errors)
            if tag[1] not in DOMAINS:
                fail(f"{index_path.relative_to(ROOT)}:{line_number}: 未知 Domain：{tag[1]}", errors)
            if tag[3] not in MATURITIES:
                fail(f"{index_path.relative_to(ROOT)}:{line_number}: 未知 Maturity：{tag[3]}", errors)
            if tag[4] not in PRIORITIES:
                fail(f"{index_path.relative_to(ROOT)}:{line_number}: 未知 Priority：{tag[4]}", errors)
            if tag[3] not in allowed_maturities:
                expected = "/".join(sorted(allowed_maturities))
                fail(
                    f"{index_path.relative_to(ROOT)}:{line_number}: {name} 的成熟度 {tag[3]} "
                    f"不适用于此目录（允许：{expected}）",
                    errors,
                )

            capability_index = bucket_path / name / "index.md"
            if not capability_index.is_file():
                fail(
                    f"{index_path.relative_to(ROOT)}:{line_number}: 缺少能力文件 "
                    f"{capability_index.relative_to(ROOT)}",
                    errors,
                )

        directories = {
            path.name
            for path in bucket_path.iterdir()
            if path.is_dir() and not path.name.startswith(".")
        }
        indexed = set(entries)
        for name in sorted(directories - indexed):
            fail(f"{bucket}/：目录未登记在索引中：{name}", errors)
        for name in sorted(indexed - directories):
            fail(f"{bucket}/：索引条目没有对应目录：{name}", errors)

    if errors:
        print("能力库校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("能力库结构与索引格式检查通过。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
