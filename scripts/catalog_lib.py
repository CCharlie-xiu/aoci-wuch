"""Shared helpers for editing capability indexes, the Pages homepage and README."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRO_ROOT = ROOT / "capabilities-pro"
INCUBATOR = PRO_ROOT / "capabilities-unstable"
AUTH_PAGE = "https://skill.wuch-ai.net/auth.html"
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
# English README is default; Chinese mirror is README.zh.md
README_TARGETS = (
    (ROOT / "README.md", {"capabilities": "### Stable", "capabilities-unstable": "### Experimental"}, "en"),
    (ROOT / "README.zh.md", {"capabilities": "### 正式能力", "capabilities-unstable": "### 待验证能力"}, "zh"),
)

INCUBATOR_INDEX = """# Capability Index · Incubating (private)

私有孵化区。新能力一律先写在这里，不出现在公开仓库、首页或 README。
验证通过后用 `scripts/release_capability.py` 发布为免费（公开）或订阅（[PRO]）正式能力。

```text
name[tag]: 一句话核心职责
```

---

## 能力列表

```text
```
"""


def require_pro_clone() -> None:
    if not (PRO_ROOT / ".git").exists():
        raise SystemExit(
            "本机没有私有仓库 capabilities-pro/，先执行：\n"
            "  git clone https://github.com/CCharlie-xiu/aoci-wuch-pro.git capabilities-pro"
        )


def entry_pattern(name: str) -> re.Pattern[str]:
    return re.compile(rf"^{re.escape(name)}\[([A-Z0-9]{{5}})\](\[PRO\])?:\s+(.+?)\s*$", re.M)


def find_entry(index_path: Path, name: str) -> tuple[str, bool, str] | None:
    if not index_path.is_file():
        return None
    match = entry_pattern(name).search(index_path.read_text(encoding="utf-8"))
    return (match.group(1), bool(match.group(2)), match.group(3)) if match else None


def append_index_line(index_path: Path, line: str) -> None:
    if not index_path.is_file():
        index_path.parent.mkdir(parents=True, exist_ok=True)
        index_path.write_text(INCUBATOR_INDEX, encoding="utf-8")
    lines = index_path.read_text(encoding="utf-8").splitlines()
    fences = [i for i, text in enumerate(lines) if text.strip() == "```"]
    if not fences:
        raise SystemExit(f"无法在 {index_path.relative_to(ROOT)} 中找到能力列表代码块")
    lines.insert(fences[-1], line)
    index_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def remove_index_line(index_path: Path, name: str) -> None:
    pattern = entry_pattern(name)
    lines = index_path.read_text(encoding="utf-8").splitlines()
    kept = [line for line in lines if not pattern.fullmatch(line.strip())]
    if len(kept) == len(lines):
        raise SystemExit(f"{index_path.relative_to(ROOT)} 中没有 {name} 的索引行")
    index_path.write_text("\n".join(kept) + "\n", encoding="utf-8")


def set_homepage_entry(name: str, title: str, title_en: str | None, icon: str | None, pro: bool) -> None:
    """Add or update a homepage card; omitted title_en / icon keep the existing values."""
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    existing = re.compile(rf'\{{\s*id:\s*"{re.escape(name)}"[^}}]*\}}')
    current = existing.search(html)
    if current:
        old = current.group(0)
        icon = icon or (re.search(r'icon:\s*"([^"]+)"', old) or [None, "sparkles"])[1]
        title_en = title_en or (re.search(r'nameEn:\s*"([^"]+)"', old) or [None, name])[1]
    entry = f'{{ id: "{name}", icon: "{icon or "sparkles"}", name: "{title}", nameEn: "{title_en or name}"{", pro: true" if pro else ""} }}'
    if current:
        path.write_text(html[: current.start()] + entry + html[current.end() :], encoding="utf-8")
        return
    match = re.search(r"(const capabilities = \[\n)(.*?)(\n\s*\];)", html, re.S)
    if not match:
        raise SystemExit("index.html 中找不到 const capabilities = [...]")
    body = match.group(2).rstrip()
    if not body.endswith(","):
        body += ","
    path.write_text(html[: match.start(2)] + body + "\n      " + entry + html[match.end(2) :], encoding="utf-8")


def _mostly_ascii(text: str) -> bool:
    return (sum(1 for c in text if ord(c) < 128) / max(len(text), 1)) > 0.7


def remove_readme_row(name: str) -> None:
    marker = re.compile(rf"\(capabilities(?:-unstable)?/{re.escape(name)}/\)|<!-- pro:{re.escape(name)} -->")
    for path, _, _ in README_TARGETS:
        if not path.is_file():
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        path.write_text("\n".join(l for l in lines if not (l.startswith("|") and marker.search(l))) + "\n", encoding="utf-8")


def add_readme_row(
    bucket: str,
    name: str,
    title: str,
    desc: str,
    pro: bool,
    title_en: str | None = None,
) -> None:
    for path, sections, lang in README_TARGETS:
        if not path.is_file():
            raise SystemExit(f"缺少 {path.relative_to(ROOT)}")
        lines = path.read_text(encoding="utf-8").splitlines()
        heading = sections[bucket]
        start = next((i for i, l in enumerate(lines) if l.startswith(heading)), None)
        if start is None:
            raise SystemExit(f"{path.name} 中找不到「{heading}」小节")
        end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("#")), len(lines))
        rows = [i for i in range(start, end) if lines[i].startswith("|")]
        if not rows:
            raise SystemExit(f"{path.name}「{heading}」小节没有表格")
        if lang == "en":
            display = title_en or title
            purpose = desc if _mostly_ascii(desc) else (title_en or desc)
            if pro:
                row = f"| [{display}]({AUTH_PAGE}) `PRO` | {purpose} <!-- pro:{name} --> |"
            else:
                row = f"| [{display}]({bucket}/{name}/) | {purpose} |"
        else:
            if pro:
                row = f"| [{title}]({AUTH_PAGE}) `PRO` | {desc}（订阅能力） <!-- pro:{name} --> |"
            else:
                row = f"| [{title}]({bucket}/{name}/) | {desc} |"
        lines.insert(rows[-1] + 1, row)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def name_taken(name: str) -> Path | None:
    for base in (ROOT, PRO_ROOT):
        for bucket in ("capabilities", "capabilities-unstable", "capabilities-retired"):
            if (base / bucket / name).exists():
                return base / bucket / name
    return None
