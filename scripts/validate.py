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


PAGES_BUCKETS = {
    "capabilities": "### 正式能力",
    "capabilities-unstable": "### 待验证能力",
}
PAGE_ENTRY = re.compile(r'\{\s*id:\s*"([a-z0-9-]+)"[^}]*\}')


def check_pages(catalog: dict[str, tuple[set[str], set[str]]], errors: list[str]) -> None:
    """index.html (GitHub Pages) and README must list exactly the live capabilities."""
    live = {name for bucket in PAGES_BUCKETS for name in catalog.get(bucket, (set(), set()))[0]}
    pro = {name for bucket in PAGES_BUCKETS for name in catalog.get(bucket, (set(), set()))[1]}

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    page_entries = {m.group(1): "pro: true" in m.group(0) for m in PAGE_ENTRY.finditer(html)}
    for name in sorted(live - set(page_entries)):
        fail(f"index.html：能力未出现在首页能力列表：{name}", errors)
    for name in sorted(set(page_entries) - live):
        fail(f"index.html：首页列出了不存在或已退役的能力：{name}", errors)
    for name in sorted(live & set(page_entries)):
        if page_entries[name] != (name in pro):
            expected = "需要" if name in pro else "不应"
            fail(f"index.html：{name} {expected}标记 pro: true", errors)

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for bucket, heading in PAGES_BUCKETS.items():
        start = readme.find(heading)
        if start < 0:
            fail(f"README.md：缺少「{heading}」小节", errors)
            continue
        end = readme.find("\n#", start + len(heading))
        section = readme[start : end if end > 0 else len(readme)]
        names, pro_names = catalog.get(bucket, (set(), set()))
        listed = set(re.findall(rf"\({re.escape(bucket)}/([a-z0-9-]+)/\)", section))
        listed_pro = set(re.findall(r"<!-- pro:([a-z0-9-]+) -->", section))
        for name in sorted(names - pro_names - listed):
            fail(f"README.md「{heading}」：缺少能力行（链接 {bucket}/{name}/）：{name}", errors)
        for name in sorted(pro_names - listed_pro):
            fail(f"README.md「{heading}」：订阅能力行需链接授权页并带 <!-- pro:{name} -->：{name}", errors)
        for name in sorted((listed | listed_pro) - names):
            fail(f"README.md「{heading}」：列出了不在本分区的能力：{name}", errors)
        for name in sorted(listed & pro_names):
            fail(f"README.md「{heading}」：订阅能力 {name} 不得链接到公开目录", errors)


def check_incubator(catalog: dict[str, tuple[set[str], set[str]]], errors: list[str]) -> None:
    """Private incubator: indexed only in capabilities-pro/capabilities-unstable/index.md."""
    incubator = PRO_ROOT / "capabilities-unstable"
    index_path = incubator / "index.md"
    label = "capabilities-pro/capabilities-unstable/index.md"
    if not index_path.is_file():
        fail(f"缺少私有孵化索引：{label}", errors)
        return
    names: set[str] = set()
    for line_number, line in enumerate(index_path.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "`" in stripped or stripped.startswith("name[tag]:"):
            continue
        if "[" not in stripped:
            continue
        match = ENTRY.fullmatch(stripped)
        if not match:
            fail(f"{label}:{line_number}: 索引行格式错误：{stripped}", errors)
            continue
        name, tag, pro_flag, _ = match.groups()
        if pro_flag:
            fail(f"{label}:{line_number}: 孵化区不标 [PRO]，发布时再决定：{name}", errors)
        if tag[3] not in {"E", "D"}:
            fail(f"{label}:{line_number}: {name} 的成熟度 {tag[3]} 不适用于孵化区（允许：D/E）", errors)
        if name in names:
            fail(f"{label}: 重复条目 {name}", errors)
        names.add(name)
        if not (incubator / name / "index.md").is_file():
            fail(f"{label}:{line_number}: 缺少能力文件 capabilities-pro/capabilities-unstable/{name}/index.md", errors)

    for name in sorted(subdirectories(incubator) - names):
        fail(f"capabilities-pro/capabilities-unstable/：目录未登记在私有孵化索引：{name}", errors)
    public_names = set().union(*(entries for entries, _ in catalog.values())) if catalog else set()
    for name in sorted(names & public_names):
        fail(f"{label}：{name} 同时出现在公开索引，孵化能力不得公开登记", errors)


def main() -> int:
    errors: list[str] = []
    pro_available = PRO_ROOT.is_dir()
    check_pro_isolation(errors)
    catalog: dict[str, tuple[set[str], set[str]]] = {}

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

            if pro_flag and bucket == "capabilities-unstable":
                fail(
                    f"{index_path.relative_to(ROOT)}:{line_number}: 公开待验证区不允许 [PRO]：{name}；"
                    "孵化中的能力只登记在私有索引 capabilities-pro/capabilities-unstable/index.md",
                    errors,
                )
                continue
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

        catalog[bucket] = (set(entries), pro_entries)
        public_indexed = set(entries) - pro_entries
        directories = subdirectories(bucket_path) - pro_entries
        for name in sorted(directories - public_indexed):
            fail(f"{bucket}/：目录未登记在索引中：{name}", errors)
        for name in sorted(public_indexed - directories):
            fail(f"{bucket}/：索引条目没有对应目录：{name}", errors)

        if pro_available and bucket != "capabilities-unstable":
            pro_directories = subdirectories(PRO_ROOT / bucket)
            for name in sorted(pro_directories - pro_entries):
                fail(
                    f"capabilities-pro/{bucket}/：目录未以 [PRO] 登记在 {bucket}/index.md：{name}",
                    errors,
                )
            for name in sorted(pro_entries - pro_directories):
                fail(f"capabilities-pro/{bucket}/：[PRO] 索引条目没有对应目录：{name}", errors)

    if pro_available:
        check_incubator(catalog, errors)
    check_pages(catalog, errors)

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
