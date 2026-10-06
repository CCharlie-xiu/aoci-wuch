# 06 · 大胆撞色 Bold

硬阴影（零模糊）+ 3px 粗黑描边是全部识别度。hover 向左上位移，active 向右下压入。

## 来源

- 内置风格族，无外部参考图（`tokens.md` 初版定义）
- 实测 无 —— 无参考图可比对
- 推导 全部字段为设计判断，无实测依据
- 圆角 无 R 基数（通用风格族，按 `tokens.md` 第三节按需推导）

## 版式

无固定版式 —— 通用风格族；块面化、少留白是其版式倾向。

## Token

```css
:root{
  --bg:#FFD93D; --surface:#FFFFFF; --surface-2:#FFFCF0;
  --ink:#111111; --ink-soft:#3D3D3D; --muted:#6B6B6B; --placeholder:#9B9B9B;
  --accent:#FF5C8A;
  --success:#16A34A; --danger:#E5342C; --warning:#FF9500;

  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11.5px; --fs-2:12px; --fs-3:13px; --fs-4:13.5px; --fs-5:16px; --fs-6:32px; --fs-7:38px;
  --fw-regular:600; --fw-medium:700; --fw-semibold:800;
  --lh-body:1.6; --lh-title:1.04; --ls-label:.10em;

  --r-xs:12px; --r-sm:14px; --r-md:16px; --r-lg:24px; --r-full:999px;

  --stroke:3px solid var(--ink);

  --shadow-sm:4px 4px 0 var(--ink);
  --shadow-brand:6px 6px 0 var(--accent);
  --shadow-brand-hover:8px 8px 0 var(--accent);
  --shadow-brand-active:2px 2px 0 var(--accent);
  --shadow-card:10px 10px 0 var(--ink);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 纯黑实心 + `3px` 描边 + **硬阴影零模糊**，hover 位移。**禁止渐变** | 白面 + `3px` 黑描边 + `10px` 硬阴影 | 线性 `2.5px`，`#111`，圆端点 | 圆角 `16`，可加 `3px` 黑描边 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 38px |
| 页面标题 | `--fs-6` | 32px |
| 区块标题 | `--fs-5` | 16px |
| 卡标题 / 强调 | `--fs-4` | 13.5px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 12px |
| 注脚 / eyebrow | `--fs-1` | 11.5px |

## 间距密度

紧。区块 `--s-5`（24），卡内 `--s-4`（16）；靠描边与位移拉开层级，不靠留白。

---

字号用法与间距密度为使用约定，非参考图实测。
