# 16 · 液态铬 Chrome

近黑底 + 铬合金渐变面 + 镜面高光 + 大圆角

## 来源

- 来源 `Dribbble · 3D Illustration System`
- 实测 底 `#090A0D`（61%）· 铬面 `#DFE2EA` / `#A5AEC2` / `#434C6C` · 高光 `#2D3043`
- 推导 主色、圆角、字号 —— 按 `tokens.md` 第三节推导；**参考图无蓝色主色**，我原先写的 `#6E8BFF` 无依据，已改为按实测铬面中调取蓝灰
- 圆角 R=`20`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线 + 等宽数字

## 版式

顶部横排 5 张铬面图标卡 → 下方大铬面圆环 + 右侧说明文字。

## Token

```css
:root{
  --bg:#090A0D; --surface:#111219; --surface-2:#1D1C28;
  --line:rgba(255,255,255,.10); --line-hover:rgba(255,255,255,.24);
  --ink:#E8EAF0; --ink-soft:#A5AEC2; --muted:#75798A; --faint:#4A4D5C;
  --brand:#434C6C; --brand-hover:#54608A; --brand-ink:#E8EAF0; --ring:rgba(67,76,108,.40);
  --success:#4FA97A; --danger:#D96A6A; --warning:#D9B24D;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:15px; --fs-5:20px; --fs-6:26px; --fs-7:36px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.15; --ls-title:-0.02em;

  --r-xs:10px; --r-sm:14px; --r-md:20px; --r-lg:28px; --r-xl:36px; --r-full:999px;

  --shadow-card:inset 0 1px 0 rgba(255,255,255,.10), 0 30px 70px rgba(0,0,0,.7); --shadow-brand:0 0 32px rgba(67,76,108,.55);
  --chrome:linear-gradient(135deg,#F2F4F8 0%,#B6BFD2 16%,#3A4356 36%,#DDE2EC 52%,#7D879C 68%,#22262F 84%,#EDF0F6 100%);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 蓝灰实心 + 冷光晕，**不用渐变** | 铬合金渐变面 + inset 顶部高光，圆角 `20` | 线性 `1.75px`，`#A5AEC2` | 圆角 `18`，叠冷色高光 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 36px |
| 页面标题 | `--fs-6` | 26px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

中。区块 `--s-6`（32），卡内 `--s-4`（16）；铬面卡之间留 `--s-3`。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
