# method

`video-frame-extract` 的执行细节。认知层见 `index.md`。

## 流程

```text
ffprobe 探测（时长 / 分辨率 / 旋转）
↓
确定策略（自然语言 → 参数）
↓
fps / scene：分析通道先跑，只解码不写盘，用 showinfo 取真实 PTS 与帧数
count / time：直接算时间点
↓
超限检查（此时还没写任何文件）
↓
写盘 → manifest.json → validate.py 自检
```

## 策略细节

| 模式 | 时间点怎么来 |
| --- | --- |
| `fps` | ffmpeg `fps=N` 筛选，PTS 取自分析通道 |
| `count` | `t_i = duration × (i + 0.5) / count`，取区间中点，避开首帧黑场与尾帧越界 |
| `time` | 直接解析 `12` / `1:20` / `1:02:03`，超出时长直接报错 |
| `scene` | `select=gt(scene,T)`；阈值敏感，0 帧时返回 `OK` + `warnings`，建议降低阈值 |

## 关键命令

分析通道（只解码不写盘）：

```bash
ffmpeg -loglevel info -i VIDEO -vf "fps=2,showinfo" -f null -
```

写盘（fps / scene）：

```bash
ffmpeg -loglevel error -y -i VIDEO -vf "fps=2,scale=1280:-1" \
  -fps_mode passthrough -start_number 1 OUT/frames/%05d.png
```

写盘（count / time 精确定位）：

```bash
ffmpeg -loglevel error -y -i VIDEO -ss 1.500 -vf "scale=1280:-1" \
  -frames:v 1 OUT/frames/00001.png
```

## 已实测的坑

| 坑 | 处理 |
| --- | --- |
| 旋转 | ffmpeg 的自动旋转在自定义 `-vf` 链下同样生效；**不要**手工加 `transpose`，否则二次旋转，方向错误。也不要加 `-noautorotate` |
| `-ss` 位置 | 默认放 `-i` 之后（精确、慢）；`--seek fast` 放 `-i` 之前并加 `-noaccurate_seek`（快，可能落在关键帧） |
| VFR | PTS 一律取 `showinfo`，不按帧序号推算时间 |
| 帧数一致性 | 写盘后比对实际文件数与预期，不一致直接报错 |
| webp | 需要 `libwebp` 编码器，缺失时返回 `ERROR` 而不是静默失败 |
| 版本差异 | 优先 `-fps_mode passthrough`，旧版回退 `-vsync 0` |

## 验证

```bash
python3 scripts/extract_frames.py --input VIDEO --out OUT --mode count --count 5
python3 scripts/validate.py --out OUT
```

冒烟清单（用 `ffmpeg -f lavfi -i testsrc2=size=320x240:rate=30 -t 3` 造一段测试视频）：

| 用例 | 预期 |
| --- | --- |
| `--mode fps --fps 2` | 6 张，间隔 0.5s |
| `--mode count --count 5` | 5 张，时间点落在区间中点 |
| `--mode time --times 0.5,1.5` | 2 张 |
| `--mode time --times 62`（超长） | `ERROR`，提示超出时长 |
| `--mode fps --fps 500 --max-frames 10` | `LIMIT_EXCEEDED`，退出码 2，不写文件 |
| `--format jpg --scale 160:-1` | 尺寸与格式正确 |
| 旋转素材 | 输出方向与 `ffmpeg` 默认解码一致 |
| 删除一张后跑 validate | 校验失败，退出码 1 |
