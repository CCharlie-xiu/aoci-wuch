# 08 · 自然生态 Eco

奶油白底 + 橄榄绿 + 满幅自然摄影，浅绿胶囊按钮，方角卡片

## 来源

- 来源 `Dribbble · Earth Day Brand Recognition（Sustainable Web Design）`
- 实测 底 `#EEEDE9` · 暗 `#191B1A` · 中间调 `#555D4F` / `#34382E` · 最高饱和 `#474D26`（S.50 / 10%）
- 推导 主色、面、线、语义色、圆角、字体、阴影 —— 按 `tokens.md` 第三节规则推导，非实测
- 圆角 R=`4`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线正文 + 衬线斜体强调词（`Songti SC` 系）

## 版式

满幅摄影 Hero（大标题叠压）→ 方角三栏卡 → 深色 CTA 段。

## Token

```css
:root{
  --bg:#EEEDE9; --surface:#F8F7F3; --surface-2:#E1E0D9;
  --line:#D2D0C5; --line-hover:#B9B7A8;
  --ink:#191B1A; --ink-soft:#34382E; --muted:#555D4F; --faint:#8A8F7C;
  --brand:#C6DE7A; --brand-hover:#D4E894; --brand-ink:#191B1A; --deep:#1F231E; --ring:rgba(31,35,30,.16);
  --success:#474D26; --danger:#9C4A38; --warning:#B08A3A;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:"Songti SC",Georgia,"Times New Roman",serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:22px; --fs-6:34px; --fs-7:56px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.65; --lh-title:1.12; --ls-title:-0.02em;

  --r-xs:2px; --r-sm:3px; --r-md:4px; --r-lg:6px; --r-xl:7px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 浅绿 pill，深墨字。**无渐变无发光**，hover 加深一档 | `1px` 描边 + 方角，**无阴影** | 线性 `1.5px`，`#34382E` | 满幅摄影，方角，可叠深色遮罩压标题区 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 56px |
| 页面标题 | `--fs-6` | 34px |
| 区块标题 | `--fs-5` | 22px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

宽。区块 `--s-7`（48），卡内 `--s-5`（24）；满幅摄影本身承担视觉重量。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
