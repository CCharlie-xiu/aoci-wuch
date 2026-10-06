# 17 · 复古印刷 Retro Print

哑光中饱和色块 + 等宽编号与条码装饰 + 细分割线，机械制图感

## 来源

- 来源 `Dribbble · Retro cyberpunk design (CBRPNK)`
- 实测 黑 `#000000`（35%）· 灰绿 `#7D8F7C`（20%）· 橘 `#DFA15E`（19%）· 砖红 `#A44C44`（10%）
- 推导 圆角、字号、主色（作按钮用）—— 按 `tokens.md` 第三节推导；**色块取实测，我原先写的红/绿偏饱和，已修正**
- 圆角 R=`14`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 等宽编号 + 几何无衬线混排

## 版式

左侧哑光红大卡（等宽编号 + 大标题 + 条码）→ 右侧橘 / 绿 / 灰三张色卡。

## Token

```css
:root{
  --bg:#0D0D0D; --surface:#A44C44; --surface-2:#DFA15E; --surface-3:#7D8F7C; --surface-4:#9F978D;
  --line:rgba(13,13,13,.35); --line-hover:rgba(13,13,13,.6);
  --ink:#141414; --ink-soft:#3A322C; --muted:#6B6058; --faint:#8E8378; --ink-inv:#F0EDE8;
  --brand:#141414; --brand-hover:#2E2A26; --ring:rgba(164,76,68,.30);
  --success:#7D8F7C; --danger:#A44C44; --warning:#DFA15E;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:10px; --fs-2:11.5px; --fs-3:13px; --fs-4:14px; --fs-5:18px; --fs-6:26px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:700;
  --lh-body:1.55; --lh-title:1.06; --ls-label:.14em;

  --r-xs:7px; --r-sm:10px; --r-md:14px; --r-lg:20px; --r-xl:25px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 近黑实心 pill，**无渐变无阴影** | 哑光色块 + `1px` 深描边，**无阴影** | 线性 `1.5px`，`#141414`，配等宽编号 | 圆角 `16`，可叠单色遮罩 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 40px |
| 页面标题 | `--fs-6` | 26px |
| 区块标题 | `--fs-5` | 18px |
| 卡标题 / 强调 | `--fs-4` | 14px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 11.5px |
| 注脚 / eyebrow | `--fs-1` | 10px |

## 间距密度

中。区块 `--s-5`（24），卡内 `--s-4`（16）。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
