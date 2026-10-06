# 15 · 噪点暗红 Noise

近黑底 + 玫粉 + 位图噪点 + 印刷错位，等宽字为主

## 来源

- 来源 `Dribbble · Monolith Dark Bold Brutalist Music Record Label`
- 实测 底 `#080808`（33%）· 玫粉 `#E94E79`（S.66 / 20%）· 亮粉 `#EA80A6` · 暗红 `#742F42`
- 推导 噪点纹理、错位量、圆角、字号 —— 按 `tokens.md` 第三节推导；**粉为实测，我原先写的 `#FF2D78` 过饱和，已修正**
- 圆角 R=`2`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 等宽字为主（`SF Mono` 系），标题用方角位图气质

## 版式

左大标题块（错位叠印）→ 右侧编号卡网格 → 等宽编号标签贯穿。

## Token

```css
:root{
  --bg:#080808; --surface:#141414; --surface-2:#1C1C1C;
  --line:rgba(255,255,255,.10); --line-hover:rgba(233,78,121,.55);
  --ink:#F2F2F2; --ink-soft:#A8A8A8; --muted:#7A7A7A; --faint:#4A4A4A;
  --brand:#E94E79; --brand-2:#EA80A6; --ring:rgba(233,78,121,.30);
  --success:#3FBF7F; --danger:#E94E79; --warning:#D9A94D;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:10.5px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:18px; --fs-6:26px; --fs-7:38px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.05; --ls-label:.12em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:0 0 0 1px rgba(255,255,255,.08); --shadow-brand:0 0 28px rgba(233,78,121,.45);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 玫粉实心 + 同色发光，方角 | 近黑面 + `1px` 白线，**方角**，可叠噪点 | 线性 `1.5px`，`#A8A8A8`，等宽字标签 | 方角，叠噪点与粉色调 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 38px |
| 页面标题 | `--fs-6` | 26px |
| 区块标题 | `--fs-5` | 18px |
| 卡标题 / 强调 | `--fs-4` | 14px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 12px |
| 注脚 / eyebrow | `--fs-1` | 10.5px |

## 间距密度

紧。区块 `--s-4`（16），卡内 `--s-3`（12）；错位叠印需要紧凑。

---

字号用法与间距密度为使用约定，非参考图实测。
