# video-frame-extract

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`video-frame-extract[TM8DH]`

F: 按自然语言要求从视频中提取画面，生成有序图片集合
R:
A: `scripts/extract_frames.py`（执行入口，契约见「使用入口」）；`scripts/validate.py`（产物自检）；`method.md`（ffmpeg 执行细节）；`templates/handoff.md`（交付与回问话术）
S: VFR 视频按真实 PTS 记录，不以帧序号代替时间；旋转由 ffmpeg 自动处理，不得手工叠加 transpose；默认精确时间定位，快速定位须显式声明；默认上限 600 张，超限返回 LIMIT_EXCEEDED，不静默截断；只处理画面，不抽音频、不抠像、不去背、不做视觉内容理解

---

## 这是什么

把「从视频里拿图片」变成一次确定性调用：AI 把自然语言翻译成抽帧策略，脚本执行 ffmpeg/ffprobe，输出有序图片集合。

用户不需要知道 fps、scale、seek。AI 需要知道：什么时候调用、翻译成哪个策略、拿回什么。

## 什么时候用

| 用户说 | 策略 | 参数 |
| --- | --- | --- |
| 每隔 2 秒抽一张 / 每秒抽一张 | `fps` | `fps=0.5` |
| 抽 20 张 / 均匀抽 N 张 | `count` | `count=20` |
| 在 00:12、00:35 截几张 | `time` | `times=12,35` |
| 把场景切换都抽出来 | `scene` | `threshold=0.4` |
| 抽 20 张最有代表性的画面 | **越界** | 见「边界」 |

## 使用入口

```text
python3 scripts/extract_frames.py --input VIDEO --out DIR --mode fps|count|time|scene

fps    --fps N
count  --count N
time   --times 1.2,3.5,1:20
scene  --threshold 0.4

可选  --format png|jpg|webp   --scale 1280:-1
      --seek accurate|fast    --max-frames 600
```

| 退出码 | 状态 | 含义 |
| --- | --- | --- |
| 0 | `OK` | 已写出产物 |
| 2 | `LIMIT_EXCEEDED` | 预计帧数超上限，未写任何文件，返回 `estimated_frames` 与建议 |
| 3 | `ERROR` | 输入、环境或 ffmpeg 出错，返回 `message` |

产物固定在 `<out>/frames/`，供后续能力（如 `image-grid`）稳定组合：

```text
<out>/
├── frames/
│   ├── 00001.png
│   └── 00002.png
└── manifest.json
```

`manifest.json`：`source`、`duration`、`extraction_mode`、`parameters`、`format`、`scale`、`rotation_applied`、`frame_count`、`frames[]`（`index` / `filename` / `pts` / `timestamp`）。

执行完跑一次自检：

```text
python3 scripts/validate.py --out DIR [--expect N]
```

## 回问

- 数量无法从需求合理推断
- 超过 600 张
- 要求「最有代表性」等视觉语义筛选
- 混合策略且语义不明确

## 最终交付

本能力生成产物并返回有序清单，不负责展示。展示由调用方决定：≤12 张直接展示；>12 张给目录并展示首尾或代表帧。话术见 `templates/handoff.md`。

## 边界

```text
时间采样（fps / count）   场景采样（scene）   指定时间（times）
                └──────────────┼──────────────┘
                               ↓
                    图片集合 + manifest
                               ×
                  不判断「最好 / 最有代表性」
```

需要「最有价值的 N 张」时，走更高层能力：先高密度采样，再由视觉模型去重与评分。本能力不冒充视觉理解。
