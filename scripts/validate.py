#!/usr/bin/env python3
"""Validate capability index entries against the repository's directory layout."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRO_ROOT = ROOT / "capabilities-pro"
BUCKETS = {
    "capabilities": {"S", "M"},
    "capabilities-unstable": {"E", "D"},
    "capabilities-retired": {"E", "D", "S", "M"},
}
ENTRY = re.compile(
    r"^([a-z0-9]+(?:-[a-z0-9]+)*)\[([A-Z]{2}[1-9][A-Z]{2})\](\[PRO\])?:\s+(.+?)\s*$"
)
TYPES = set("OSTKMZ")
DOMAINS = set("ADIMFWO")
MATURITIES = set("EDSM")
PRIORITIES = set("LMH")


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def subdirectories(path: Path) -> set[str]:
    if not path.is_dir():
        return set()
    return {p.name for p in path.iterdir() if p.is_dir() and not p.name.startswith(".")}


def check_pro_isolation(errors: list[str]) -> None:
    """The private clone must never be tracked by the public repository."""
    try:
        ignored = subprocess.run(
            ["git", "check-ignore", "-q", "capabilities-pro/"],
            cwd=ROOT,
            capture_output=True,
        ).returncode == 0
        tracked = subprocess.run(
            ["git", "ls-files", "capabilities-pro"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        ).stdout.strip()
    except FileNotFoundError:
        return
    if not ignored:
        fail(".gitignore 未排除 capabilities-pro/，订阅正文可能被提交到公开仓库", errors)
    if tracked:
        fail(f"公开仓库已跟踪 capabilities-pro/ 下的文件：{tracked.splitlines()[0]} 等", errors)


def main() -> int:
    errors: list[str] = []
    pro_available = PRO_ROOT.is_dir()
    check_pro_isolation(errors)

    for bucket, allowed_maturities in BUCKETS.items():
        bucket_path = ROOT / bucket
        index_path = bucket_path / "index.md"
        if not index_path.is_file():
            fail(f"缺少索引文件：{index_path.relative_to(ROOT)}", errors)
            continue

        entries: dict[str, tuple[str, int]] = {}
        pro_entries: set[str] = set()
        for line_number, line in enumerate(
            index_path.read_text(encoding="utf-8").splitlines(), start=1
        ):
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "`" in stripped:
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

            name, tag, pro_flag, _description = match.groups()
            if name in entries:
                fail(f"{index_path.relative_to(ROOT)}: 重复条目 {name}", errors)
            else:
                entries[name] = (tag, line_number)
            if pro_flag:
                pro_entries.add(name)

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

            if pro_flag:
                if (bucket_path / name).exists():
                    fail(
                        f"{index_path.relative_to(ROOT)}:{line_number}: 订阅能力 {name} 的正文"
                        f"出现在公开目录 {bucket}/{name}/，必须放到 capabilities-pro/{bucket}/{name}/",
                        errors,
                    )
                if not pro_available:
                    continue
                capability_index = PRO_ROOT / bucket / name / "index.md"
            else:
                capability_index = bucket_path / name / "index.md"
            if not capability_index.is_file():
                fail(
                    f"{index_path.relative_to(ROOT)}:{line_number}: 缺少能力文件 "
                    f"{capability_index.relative_to(ROOT)}",
                    errors,
                )

        public_indexed = set(entries) - pro_entries
        directories = subdirectories(bucket_path) - pro_entries
        for name in sorted(directories - public_indexed):
            fail(f"{bucket}/：目录未登记在索引中：{name}", errors)
        for name in sorted(public_indexed - directories):
            fail(f"{bucket}/：索引条目没有对应目录：{name}", errors)

        if pro_available:
            pro_directories = subdirectories(PRO_ROOT / bucket)
            for name in sorted(pro_directories - pro_entries):
                fail(
                    f"capabilities-pro/{bucket}/：目录未以 [PRO] 登记在 {bucket}/index.md：{name}",
                    errors,
                )
            for name in sorted(pro_entries - pro_directories):
                fail(f"capabilities-pro/{bucket}/：[PRO] 索引条目没有对应目录：{name}", errors)

    if errors:
        print("能力库校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    if pro_available:
        print("能力库结构与索引格式检查通过（含订阅能力 capabilities-pro/）。")
    else:
        print("能力库结构与索引格式检查通过（本机无 capabilities-pro/，未检查订阅正文）。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
