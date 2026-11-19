#!/usr/bin/env python3
"""Validate a WorkBuddy / Agent Skill directory before zip upload."""

from __future__ import annotations

import re
import sys
from pathlib import Path

REQUIRED = [
    "name",
    "display_name",
    "display_name_en",
    "description",
    "description_zh",
    "description_en",
    "version",
    "author",
]

BAD_QUOTES = re.compile(r"[“”‘’]")
NAME_OK = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def parse_frontmatter(text: str) -> tuple[dict[str, object], list[str]]:
    errors: list[str] = []
    if not text.startswith("---"):
        return {}, ["SKILL.md must start with YAML frontmatter ---"]
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, ["frontmatter not closed with ---"]
    fm_raw = parts[1]
    if BAD_QUOTES.search(fm_raw):
        errors.append("frontmatter contains fullwidth quotes")
    data: dict[str, object] = {}
    lines = fm_raw.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        # list item continuation handled below
        if line.startswith("  - ") or (line.startswith("- ") and ":" not in line.split("-", 1)[0]):
            errors.append(f"orphan list item: {line!r}")
            i += 1
            continue
        if ":" not in line:
            errors.append(f"line missing colon: {line!r}")
            i += 1
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        if key.startswith("-"):
            errors.append(f"unexpected list syntax: {line!r}")
            i += 1
            continue
        # require space after colon when non-empty inline value (not block indicator)
        raw_val = val
        if raw_val and not raw_val.startswith(" ") and raw_val not in ("\n",):
            # allow empty (start of list/block)
            if raw_val.strip() and not raw_val.startswith(" "):
                errors.append(f"missing space after colon for key '{key}'")
        val = val.strip()
        if val in (">", ">-", "|", "|-"):
            # folded/literal block: collect indented lines
            i += 1
            buf: list[str] = []
            while i < len(lines) and (lines[i].startswith("  ") or lines[i].startswith("\t") or not lines[i].strip()):
                if lines[i].strip():
                    buf.append(lines[i].strip())
                i += 1
            data[key] = " ".join(buf)
            continue
        if val == "":
            # list under key
            i += 1
            items: list[str] = []
            while i < len(lines) and lines[i].lstrip().startswith("- "):
                item = lines[i].lstrip()[2:].strip().strip('"').strip("'")
                items.append(item)
                i += 1
            data[key] = items
            continue
        data[key] = val.strip('"').strip("'")
        i += 1
    return data, errors


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 validate-wb-skill.py <skill-dir>", file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).expanduser().resolve()
    skill = root / "SKILL.md"
    errors: list[str] = []
    warns: list[str] = []
    if not skill.is_file():
        print(f"FAIL missing {skill}")
        return 1
    text = skill.read_text(encoding="utf-8")
    data, fm_errors = parse_frontmatter(text)
    errors.extend(fm_errors)
    # WorkBuddy uses a real YAML parser; catch colon/quote issues our light parser misses.
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                import yaml  # type: ignore

                loaded = yaml.safe_load(parts[1])
                if not isinstance(loaded, dict):
                    errors.append("frontmatter YAML did not parse to a mapping")
                else:
                    data = {**data, **{k: loaded[k] for k in loaded}}
            except ImportError:
                warns.append("PyYAML not installed; skip strict YAML parse")
            except Exception as exc:
                errors.append(f"frontmatter YAML parse failed: {exc}")
    for k in REQUIRED:
        if k not in data or data[k] in ("", None, []):
            errors.append(f"missing required field: {k}")
    name = str(data.get("name", ""))
    if name and not NAME_OK.match(name):
        errors.append(f"invalid name: {name}")
    if name and root.name != name:
        errors.append(f"directory name '{root.name}' != name '{name}'")
    for ek in ("examples_zh", "examples_en"):
        if ek in data:
            items = data[ek]
            if not isinstance(items, list):
                errors.append(f"{ek} must be a list")
            elif len(items) > 3:
                errors.append(f"{ek} must have at most 3 items (got {len(items)})")
    body = text.split("---", 2)[-1]
    if len(body) > 20000:
        warns.append("body is very long; prefer moving detail to references/")
    for p in root.rglob("*"):
        if p.name == ".DS_Store" or p.name == ".git" or ".git" in p.parts:
            errors.append(f"remove {p.relative_to(root)} from package tree before zip")
            break
        if p.is_file() and p.name != "PACKAGING.md":
            # WorkBuddy: root/二级目录/文件，相对技能根最多 2 段
            if len(p.relative_to(root).parts) > 2:
                errors.append(
                    f"directory too deep (max 2 levels): {p.relative_to(root)} "
                    "(only skill-root/subdir/file allowed)"
                )
    for w in warns:
        print(f"WARN {w}")
    if errors:
        for e in errors:
            print(f"FAIL {e}")
        return 1
    print(f"OK {root} name={name} version={data.get('version')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
