# 11 · 网格渐变 Mesh

白底 + 大面积极柔网格光斑，零边框零阴影，按钮反而用纯色

## 来源

- 来源 `Dribbble · Appinio Gradients`
- 实测 底 `#FBFBFB`（31%）· 蓝 `#344CC8`（S.74）· 橙 `#F16748` · 淡紫 `#DFE4F9` / `#C9D1F9`
- 推导 圆角、字号、语义色 —— 按 `tokens.md` 第三节推导；光斑位置为示意，非实测坐标
- 圆角 R=`20`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线，字距收紧（`-0.025em`）

## 版式

居中大标题 + 极柔网格光斑背景 → 纯色主按钮 → 三栏小字。

## Token

```css
:root{
  --bg:#FBFBFB; --surface:#FFFFFF; --surface-2:#F4F4F7;
  --line:rgba(17,17,20,.06); --line-hover:rgba(17,17,20,.14);
  --ink:#17171A; --ink-soft:#5A5A62; --muted:#93939C; --faint:#C2C2CA;
  --brand:#344CC8; --brand-2:#F16748; --ring:rgba(52,76,200,.16);
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:28px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.65; --lh-title:1.18; --ls-title:-0.025em;

  --r-xs:10px; --r-sm:14px; --r-md:20px; --r-lg:28px; --r-xl:36px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
  --mesh-a:#F16748; --mesh-b:#344CC8; --mesh-c:#DFE4F9;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 纯色实心，**禁止渐变**——渐变只给背景大面 | 白面或全透明，**无边框无阴影** | 线性 `1.75px`，`#5A5A62` | 圆角 `20`，不加滤镜 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 40px |
| 页面标题 | `--fs-6` | 28px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

极宽。区块 `--s-8`~`--s-9`（64/96）；留白用来承载光斑，不能挤。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
