# 18 · 奢华暗调 Luxury

深褐暗底 + 象牙白 + 细衬线大标题 + 发丝线，方角

## 来源

- 来源 `Dribbble · LORÉN Luxury Perfume & Body Care E-Commerce`
- 实测 深褐 `#301C13`（36%）· 象牙 `#F1ECE9`（15%）/ `#E9E2D5` · 中褐 `#4D3123` · 浅褐 `#D7CBB9`
- 推导 圆角、字号、阴影 —— 按 `tokens.md` 第三节推导；**参考图无金色**，我原先写的 `#C9A227` 无依据，已改为按实测中褐取强调色
- 圆角 R=`2`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 细衬线大标题（`Songti SC` 系）+ 大字距小标签（`.18em`）

## 版式

深褐满幅 Hero（细衬线大标题 + 发丝线按钮）→ 象牙白正文分栏 + 三栏小图。

## Token

```css
:root{
  --bg:#301C13; --surface:#3D2618; --surface-2:#4D3123; --ivory:#F1ECE9; --ivory-2:#E9E2D5;
  --line:rgba(241,236,233,.16); --line-hover:rgba(215,203,185,.55);
  --ink:#F1ECE9; --ink-soft:#D7CBB9; --muted:#9E826A; --faint:#775641;
  --brand:#D7CBB9; --brand-hover:#E9E2D5; --brand-ink:#301C13; --ring:rgba(215,203,185,.24);
  --success:#7A8C5A; --danger:#A44C44; --warning:#B08A3A;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:"Songti SC",Georgia,"Times New Roman",serif;
  --fs-1:10px; --fs-2:11.5px; --fs-3:13px; --fs-4:15px; --fs-5:22px; --fs-6:36px; --fs-7:56px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.75; --lh-title:1.1; --ls-label:.18em; --ls-title:-0.01em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 象牙白实心或细描边，**无渐变无发光** | 深褐面 + `1px` 发丝线，**方角零阴影** | 线性 `1.25px`，细，`#D7CBB9` | 方角，暖调压暗，可全出血 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 56px |
| 页面标题 | `--fs-6` | 36px |
| 区块标题 | `--fs-5` | 22px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 11.5px |
| 注脚 / eyebrow | `--fs-1` | 10px |

## 间距密度

极宽。区块 `--s-8`~`--s-9`（64/96），正文行高 `1.75`；奢华感来自留白。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
