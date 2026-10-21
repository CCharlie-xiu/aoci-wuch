#!/usr/bin/env python3
"""从视频中抽取画面，生成有序图片集合与 manifest。

只做画面采样：不抽音频、不抠像、不去背、不做视觉内容理解。

状态与退出码：
    OK             = 0
    LIMIT_EXCEEDED = 2
    ERROR          = 3
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_MAX_FRAMES = 600
DEFAULT_THRESHOLD = 0.4
# 超过这个数量：交付方式由「逐张展示」切换为「总结 + 压缩包」
DELIVERY_PREVIEW_LIMIT = 12
PTS_RE = re.compile(r"pts_time:(-?\d+(?:\.\d+)?)")
SCALE_RE = re.compile(r"^(-?\d+):(-?\d+)$")
TIME_RE = re.compile(r"^(?:(?:(\d+):)?(\d+):)?(\d+(?:\.\d+)?)$")

FORMAT_ENCODERS = {"png": None, "jpg": "mjpeg", "webp": "libwebp"}


class ExtractionError(Exception):
    pass


class LimitExceeded(Exception):
    def __init__(self, estimated: int, max_frames: int) -> None:
        super().__init__(f"预计 {estimated} 张，超过上限 {max_frames}")
        self.estimated = estimated
        self.max_frames = max_frames


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, capture_output=True, text=True)


def require_tool(name: str) -> None:
    if run(["which", name]).returncode != 0:
        raise ExtractionError(f"未找到 {name}，本能力依赖 ffmpeg / ffprobe")


def parse_time(value: str) -> float:
    text = value.strip()
    match = TIME_RE.match(text)
    if not match:
        raise ExtractionError(f"无法解析时间：{value}（支持 12 / 1:20 / 1:02:03）")
    hours, minutes, seconds = match.groups()
    total = float(seconds)
    if minutes is not None:
        total += int(minutes) * 60
    if hours is not None:
        total += int(hours) * 3600
    return total


def parse_times(raw: str) -> list[float]:
    values = [parse_time(item) for item in raw.split(",") if item.strip()]
    if not values:
        raise ExtractionError("--times 为空")
    return values


def probe(video: Path) -> dict:
    command = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration,nb_frames,r_frame_rate",
        "-show_entries", "format=duration",
        "-of", "json", str(video),
    ]
    completed = run(command)
    if completed.returncode != 0:
        raise ExtractionError(f"ffprobe 读取失败：{completed.stderr.strip()}")
    data = json.loads(completed.stdout or "{}")
    streams = data.get("streams") or []
    if not streams:
        raise ExtractionError("视频中没有找到视频流")
    stream = streams[0]
    duration = stream.get("duration") or (data.get("format") or {}).get("duration")
    return {
        "width": int(stream.get("width") or 0),
        "height": int(stream.get("height") or 0),
        "duration": float(duration) if duration else None,
        "frame_rate": stream.get("r_frame_rate"),
    }


def probe_rotation(video: Path) -> int | None:
    command = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream_side_data=rotation",
        "-of", "json", str(video),
    ]
    completed = run(command)
    if completed.returncode != 0:
        return None
    try:
        data = json.loads(completed.stdout or "{}")
    except json.JSONDecodeError:
        return None
    for stream in data.get("streams") or []:
        for side in stream.get("side_data_list") or []:
            if "rotation" in side:
                return int(round(float(side["rotation"]))) % 360 or None
    return None


def sanitize_prefix(name: str) -> str:
    """文件名前缀：% 会被 ffmpeg 当成编号占位符，必须替换。"""
    cleaned = name.replace("%", "_").replace("/", "_").strip()
    return cleaned or "frame"


def frame_name(prefix: str, index: int, ext: str) -> str:
    return f"{prefix}_{index:04d}.{ext}"


def build_filter(selector: str | None, scale: str | None) -> str:
    parts: list[str] = []
    if selector:
        parts.append(selector)
    if scale:
        parts.append(f"scale={scale}")
    return ",".join(parts)


def analyze_pts(video: Path, selector: str) -> list[float]:
    """只解码不写盘，拿到真实 PTS 与帧数。"""
    video_filter = build_filter(selector, None)
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "info", "-nostdin", "-an", "-sn",
        "-i", str(video), "-vf", f"{video_filter},showinfo", "-f", "null", "-",
    ]
    completed = run(command)
    if completed.returncode != 0:
        raise ExtractionError(f"分析视频失败：{completed.stderr.strip()[-400:]}")
    return [float(value) for value in PTS_RE.findall(completed.stderr)]


def clear_previous(out_dir: Path, prefix: str, ext: str) -> None:
    """清掉同前缀的旧产物，避免残留文件混入帧数统计。"""
    for path in out_dir.glob(f"{prefix}_*.{ext}"):
        path.unlink()


def make_zip(out_dir: Path, parent: Path, prefix: str) -> Path:
    """把 frames/ 与 manifest.json 打成一个可下载的压缩包。"""
    import zipfile

    zip_path = parent / f"{prefix}_frames.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        manifest = parent / "manifest.json"
        if manifest.is_file():
            archive.write(manifest, "manifest.json")
        for path in sorted(out_dir.iterdir()):
            if path.is_file():
                archive.write(path, f"frames/{path.name}")
    return zip_path


def write_frames(video: Path, out_dir: Path, video_filter: str, ext: str,
                 expected: int, prefix: str) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    clear_previous(out_dir, prefix, ext)
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-nostdin", "-an", "-sn"]
    command += ["-i", str(video)]
    if video_filter:
        command += ["-vf", video_filter]
    if ext == "webp":
        command += ["-c:v", "libwebp"]
    elif ext == "jpg":
        command += ["-q:v", "2"]
    command += ["-fps_mode", "passthrough", "-start_number", "1",
                str(out_dir / f"{prefix}_%04d.{ext}")]
    completed = run(command)
    if completed.returncode != 0 and "fps_mode" in completed.stderr:
        command = [item for item in command if item not in {"-fps_mode", "passthrough"}]
        command += ["-vsync", "0"]
        completed = run(command)
    if completed.returncode != 0:
        raise ExtractionError(f"抽帧失败：{completed.stderr.strip()[-400:]}")
    files = sorted(out_dir.glob(f"{prefix}_*.{ext}"))
    if len(files) != expected:
        raise ExtractionError(
            f"帧数不一致：预期 {expected} 张，实际 {len(files)} 张"
        )
    return files


def write_single(video: Path, target: Path, timestamp: float, seek: str,
                 video_filter: str, ext: str) -> None:
    if seek == "accurate":
        command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-nostdin", "-an", "-sn"]
        command += ["-i", str(video), "-ss", f"{timestamp:.3f}"]
    else:
        command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-nostdin", "-an", "-sn"]
        command += ["-ss", f"{timestamp:.3f}", "-noaccurate_seek", "-i", str(video)]
    if video_filter:
        command += ["-vf", video_filter]
    if ext == "webp":
        command += ["-c:v", "libwebp"]
    elif ext == "jpg":
        command += ["-q:v", "2"]
    command += ["-frames:v", "1", str(target)]
    completed = run(command)
    if completed.returncode != 0:
        raise ExtractionError(
            f"在 {timestamp:.3f}s 抽帧失败：{completed.stderr.strip()[-300:]}"
        )
    if not target.is_file() or target.stat().st_size == 0:
        raise ExtractionError(
            f"在 {timestamp:.3f}s 处没有画面（时间点可能超出视频实际长度）"
        )


def format_timestamp(seconds: float) -> str:
    seconds = max(seconds, 0.0)
    hours, rest = divmod(int(seconds), 3600)
    minutes, secs = divmod(rest, 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def check_encoder(ext: str) -> None:
    encoder = FORMAT_ENCODERS[ext]
    if not encoder:
        return
    completed = run(["ffmpeg", "-hide_banner", "-encoders"])
    if encoder not in completed.stdout:
        raise ExtractionError(f"当前 ffmpeg 缺少 {encoder} 编码器，无法输出 {ext}")


def guard_limit(count: int, max_frames: int) -> None:
    if count > max_frames:
        raise LimitExceeded(count, max_frames)


def emit(payload: dict, code: int) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    raise SystemExit(code)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="按策略从视频中抽取画面")
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--mode", required=True, choices=["fps", "count", "time", "scene"])
    parser.add_argument("--fps", type=float)
    parser.add_argument("--count", type=int)
    parser.add_argument("--times")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    parser.add_argument("--format", default="png", choices=list(FORMAT_ENCODERS))
    parser.add_argument("--scale")
    parser.add_argument("--seek", default="accurate", choices=["accurate", "fast"])
    parser.add_argument("--max-frames", type=int, default=DEFAULT_MAX_FRAMES)
    parser.add_argument("--name-prefix", help="图片名前缀，默认取视频文件名")
    parser.add_argument("--zip", default="auto", choices=["auto", "always", "never"])
    return parser.parse_args(argv)


def resolve_strategy(args: argparse.Namespace) -> tuple[str | None, list[float] | None]:
    """返回 (selector, 预知时间戳)。selector 为空表示按时间点逐张抽取。"""
    if args.mode == "fps":
        if not args.fps or args.fps <= 0:
            raise ExtractionError("fps 模式需要 --fps 且大于 0")
        return f"fps={args.fps}", None
    if args.mode == "scene":
        if not 0 < args.threshold < 1:
            raise ExtractionError("scene 模式的 --threshold 必须在 0 与 1 之间")
        return f"select=gt(scene\\,{args.threshold})", None
    if args.mode == "time":
        if not args.times:
            raise ExtractionError("time 模式需要 --times")
        return None, parse_times(args.times)
    if args.mode == "count":
        if not args.count or args.count <= 0:
            raise ExtractionError("count 模式需要 --count 且大于 0")
        return None, None
    raise ExtractionError(f"未知模式：{args.mode}")


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        require_tool("ffmpeg")
        require_tool("ffprobe")
        if args.scale and not SCALE_RE.match(args.scale):
            raise ExtractionError("--scale 格式应为 W:H、W:-1 或 -1:H")
        check_encoder(args.format)
        video = Path(args.input).expanduser().resolve()
        if not video.is_file():
            raise ExtractionError(f"视频不存在：{video}")
        out_dir = Path(args.out).expanduser().resolve() / "frames"
        prefix = sanitize_prefix(args.name_prefix or video.stem)
        selector, known_times = resolve_strategy(args)
        rotation = probe_rotation(video)
        info = probe(video)

        if args.mode == "count":
            if not info["duration"]:
                raise ExtractionError("无法读取视频时长，count 模式不可用")
            duration = info["duration"]
            guard_limit(args.count, args.max_frames)
            stamps = [duration * (i + 0.5) / args.count for i in range(args.count)]
        elif args.mode == "time":
            guard_limit(len(known_times or []), args.max_frames)
            stamps = list(known_times or [])
            duration = info["duration"]
            if duration:
                beyond = [stamp for stamp in stamps if stamp > duration]
                if beyond:
                    raise ExtractionError(
                        "时间点超出视频时长 "
                        f"{duration:.3f}s：{', '.join(f'{s:.3f}s' for s in beyond)}"
                    )
        else:
            stamps = analyze_pts(video, selector or "")
            guard_limit(len(stamps), args.max_frames)

        if args.mode in {"fps", "scene"}:
            video_filter = build_filter(selector, args.scale)
            files = write_frames(video, out_dir, video_filter, args.format,
                                 len(stamps), prefix)
        else:
            video_filter = build_filter(None, args.scale)
            out_dir.mkdir(parents=True, exist_ok=True)
            clear_previous(out_dir, prefix, args.format)
            files = []
            for index, stamp in enumerate(stamps, start=1):
                target = out_dir / frame_name(prefix, index, args.format)
                write_single(video, target, stamp, args.seek, video_filter, args.format)
                files.append(target)

        frames = [
            {
                "index": index,
                "filename": path.name,
                "pts": round(stamp, 3),
                "timestamp": format_timestamp(stamp),
            }
            for index, (path, stamp) in enumerate(zip(files, stamps), start=1)
        ]
        manifest = {
            "source": str(video),
            "duration": info["duration"],
            "extraction_mode": args.mode,
            "parameters": {
                "fps": args.fps,
                "count": args.count,
                "times": args.times,
                "threshold": args.threshold if args.mode == "scene" else None,
            },
            "format": args.format,
            "scale": args.scale,
            "rotation_applied": rotation,
            "name_prefix": prefix,
            "frame_count": len(frames),
            "frames": frames,
        }
        manifest_path = Path(args.out).expanduser().resolve() / "manifest.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        parent = manifest_path.parent
        many = len(frames) > DELIVERY_PREVIEW_LIMIT
        zip_path = None
        if frames and (args.zip == "always" or (args.zip == "auto" and many)):
            zip_path = make_zip(out_dir, parent, prefix)
        interval = None
        if args.mode == "fps" and args.fps:
            interval = round(1 / args.fps, 3)
        elif args.mode == "count" and args.count and info["duration"]:
            interval = round(info["duration"] / args.count, 3)
        payload = {
            "status": "OK",
            "out": str(parent),
            "frames_dir": str(out_dir),
            "frame_count": len(frames),
            "manifest": str(manifest_path),
            "zip": str(zip_path) if zip_path else None,
            "summary": {
                "source_name": video.name,
                "name_prefix": prefix,
                "mode": args.mode,
                "frame_count": len(frames),
                "interval_seconds": interval,
                "time_range": [frames[0]["pts"], frames[-1]["pts"]] if frames else None,
                "duration": info["duration"],
                "delivery": "zip" if (many or zip_path) else "preview",
                "delivery_limit": DELIVERY_PREVIEW_LIMIT,
            },
        }
        if not frames:
            payload["warnings"] = ["未抽取到任何画面：scene 模式可降低 --threshold"]
        emit(payload, 0)
    except LimitExceeded as error:
        emit({
            "status": "LIMIT_EXCEEDED",
            "estimated_frames": error.estimated,
            "max_frames": error.max_frames,
            "suggestion": {"mode": "count", "count": error.max_frames},
        }, 2)
    except ExtractionError as error:
        emit({"status": "ERROR", "message": str(error)}, 3)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
