# 14 · 野兽派 Brutalist

高饱和纯黄 + 近黑块 + 零圆角零阴影，粗黑字与手绘装饰

## 来源

- 来源 `Dribbble · Kool Boys Ski & Snowboard Event Website`
- 实测 黄 `#FEE300`（S=1.00 / 16%）· 纯黑 `#000000`（19%）· 照片冷调 `#355E70` / `#899DAB`
- 推导 语义色、字号、字体族 —— 按 `tokens.md` 第三节推导；**黄为实测，我原先写的 `#F2DF1B` 偏金，已修正**
- 圆角 R=`2`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 超粗无衬线标题（字重 `800`）+ 常规正文

## 版式

亮黄头版（导航 + 满幅照片 + 左粗标题右小字）→ 近黑正文段（居中大字 + 方块按钮）。

## Token

```css
:root{
  --bg:#FEE300; --surface:#FEE300; --surface-2:#F0D500;
  --line:#0A0A0A; --line-hover:#2A2A20;
  --ink:#0A0A0A; --ink-soft:#2A2A20; --muted:#6B6B3F; --faint:#A8A86E; --ink-inv:#F5F5F0;
  --block:#0A0A0A; --brand:#0A0A0A; --brand-hover:#2A2A20; --ring:rgba(10,10,10,.20); --accent:#FF3B8D;
  --success:#0A0A0A; --danger:#D8332A; --warning:#B07A10;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:34px; --fs-7:52px;
  --fw-regular:400; --fw-medium:600; --fw-semibold:800;
  --lh-body:1.55; --lh-title:0.98; --ls-title:-0.03em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 近黑实心方块，零圆角零阴影，hover 反色 | 单色块 + `2px` 黑描边，**零圆角零阴影** | 线性 `2.5px`，`#0A0A0A` | 方角，可叠 `2px` 黑描边 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 52px |
| 页面标题 | `--fs-6` | 34px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

紧。区块 `--s-4`~`--s-5`（16/24）；零留白倾向，色块直接相切。

---

字号用法与间距密度为使用约定，非参考图实测。
