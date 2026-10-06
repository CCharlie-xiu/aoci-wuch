# 04 · 编辑杂志 Editorial

靠版式而非装饰立风格。衬线大标题 + 强字距对比 + 下划线输入框 + 近乎无圆角。

## 来源

- 内置风格族，无外部参考图（`tokens.md` 初版定义）
- 实测 无 —— 无参考图可比对
- 推导 全部字段为设计判断，无实测依据
- 圆角 无 R 基数（通用风格族，按 `tokens.md` 第三节按需推导）

## 版式

无固定版式 —— 通用风格族；但版式本身是该风格的主要手段（图文错位、超大衬线标题）。

## Token

```css
:root{
  --paper:#F4F1EA; --surface:#FFFFFF; --line:#D8D2C4;
  --ink:#1A1712; --ink-soft:#57503F; --muted:#6B6255; --faint:#8A8171;
  --accent:#B3261E; --placeholder:#B3AB9B;
  --success:#3F6B4A; --danger:#B3261E; --warning:#A8761F;

  --font-serif:"Playfair Display","Songti SC",Georgia,"Times New Roman",serif;
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:10.5px; --fs-2:12px; --fs-3:13px; --fs-4:15px; --fs-5:34px;
  --fs-display:clamp(46px, 6.4vw, 80px);
  --fw-regular:400; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.85; --lh-display:.96;
  --ls-label:.16em; --ls-display:-0.022em;

  --r-xs:2px; --r-sm:2px; --r-md:2px; --r-full:999px;

  --shadow-card:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 方角 `2px` 纯黑实心，**零渐变零阴影**。hover 靠**字距变化** | **不用阴影**，靠 `1px` 线条与纸色分区 | 线性 `1.5px`，细，出现频率低 | 圆角 `2` 或全出血，可黑白 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-display` | clamp(46px, 6.4vw, 80px) |
| 页面标题 | `--fs-5` | 34px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 12px |
| 注脚 / eyebrow | `--fs-1` | 10.5px |

## 间距密度

极宽。区块 `--s-8`~`--s-9`（64/96），正文行高 `1.85`；空白本身构成版式。

---

字号用法与间距密度为使用约定，非参考图实测。
