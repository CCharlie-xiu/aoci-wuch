#!/usr/bin/env python3
"""校验 video-frame-extract 的产物目录。

用法：
    python3 validate.py --out DIR [--expect N]

检查：manifest 存在且可解析；图片数量与 manifest 一致；
命名从 00001 连续；文件非空；时间戳单调不减。
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="校验抽帧产物")
    parser.add_argument("--out", required=True)
    parser.add_argument("--expect", type=int)
    args = parser.parse_args()

    errors: list[str] = []
    out_dir = Path(args.out).expanduser().resolve()
    manifest_path = out_dir / "manifest.json"
    frames_dir = out_dir / "frames"

    if not manifest_path.is_file():
        print(f"缺少 manifest：{manifest_path}", file=sys.stderr)
        return 1
    if not frames_dir.is_dir():
        print(f"缺少 frames 目录：{frames_dir}", file=sys.stderr)
        return 1

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        print(f"manifest 无法解析：{error}", file=sys.stderr)
        return 1

    entries = manifest.get("frames") or []
    if not entries:
        errors.append("manifest 中没有 frames")
    if manifest.get("frame_count") != len(entries):
        errors.append("frame_count 与实际条目数不一致")

    for position, entry in enumerate(entries, start=1):
        expected_name = f"{position:05d}.{manifest.get('format', 'png')}"
        if entry.get("index") != position:
            errors.append(f"index 不连续：{entry.get('index')} ≠ {position}")
        if entry.get("filename") != expected_name:
            errors.append(f"命名不符：{entry.get('filename')} ≠ {expected_name}")
        path = frames_dir / str(entry.get("filename"))
        if not path.is_file():
            errors.append(f"图片缺失：{path}")
        elif path.stat().st_size == 0:
            errors.append(f"图片为空：{path}")
        if entry.get("pts") is None or entry.get("timestamp") is None:
            errors.append(f"缺少 pts/timestamp：{entry.get('filename')}")

    stamps = [entry.get("pts") for entry in entries if entry.get("pts") is not None]
    if stamps != sorted(stamps):
        errors.append("pts 非单调递增")

    extra = sorted(path.name for path in frames_dir.iterdir() if path.is_file())
    declared = {str(entry.get("filename")) for entry in entries}
    for name in extra:
        if name not in declared:
            errors.append(f"frames 目录中有未登记文件：{name}")

    if args.expect is not None and len(entries) != args.expect:
        errors.append(f"帧数与预期不符：{len(entries)} ≠ {args.expect}")

    if errors:
        print("抽帧产物校验失败：", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"抽帧产物校验通过：{len(entries)} 张，模式 {manifest.get('extraction_mode')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
