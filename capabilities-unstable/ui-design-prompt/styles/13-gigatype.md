# 13 · 巨型排版 Gigatype

超大背景字 + 单一高饱和圆形色块 + 产品图叠压，导航极简

## 来源

- 来源 `Dribbble · Adidas Neumorphism Landing Page`
- 实测 底 `#EDECF0`（32%）/ `#EAEBEF`（16%）· 主色 `#E45641`（S.71 / 9%）· 浅色同系 `#FA916B`（8%）
- 推导 字级（含超大号）、圆角、阴影 —— 按 `tokens.md` 第三节推导；**背景字字号为示意**，参考图字高约占画布 45%
- 圆角 R=`14`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线超粗标题，行高压到 `0.94`

## 版式

极简导航 → 超大背景字 + 单一高饱和圆 + 产品图叠压 → 圆形翻页钮 + 缩略图角标。

## Token

```css
:root{
  --bg:#EDECF0; --surface:#F4F4F7; --surface-2:#E5E6EC;
  --line:rgba(17,17,20,.08); --line-hover:rgba(17,17,20,.16);
  --ink:#111114; --ink-soft:#4A4A52; --muted:#8C8C94; --faint:#B8B8C0;
  --brand:#E45641; --brand-hover:#EF6C58; --ring:rgba(228,86,65,.18); --ghost:#E8AB97;
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:40px; --fs-7:96px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:0.94; --ls-title:-0.04em;

  --r-xs:7px; --r-sm:10px; --r-md:14px; --r-lg:20px; --r-xl:25px; --r-full:999px;

  --shadow-card:0 24px 60px -24px rgba(17,17,20,.28); --shadow-brand:0 12px 28px -8px rgba(228,86,65,.40);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 橙红实心 pill，**无渐变**，hover 加深一档 | 浅灰面 + 极弱阴影，圆角 `14` | 线性 `1.75px`，`#4A4A52` | 产品图无边框，叠在背景字之上 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 96px |
| 页面标题 | `--fs-6` | 40px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

中。区块 `--s-6`（32）；首屏几乎零边距，靠巨字与产品图撑满。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 与 `style-*` 约束：
字体见 `baseline.md`，颜色与渐变见 `style-color/`，动效见 `style-motion/`，
圆角 / 容器 / 图标 / 组件形态见 `style-looklike/`。
