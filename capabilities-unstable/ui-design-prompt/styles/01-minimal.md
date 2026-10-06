# 01 · 极简克制 Minimal

无卡片、无阴影、无彩色主色。层级只靠字号 + 字重 + 灰度。

## 来源

- 内置风格族，无外部参考图（`tokens.md` 初版定义）
- 实测 无 —— 无参考图可比对
- 推导 全部字段为设计判断，无实测依据
- 圆角 无 R 基数（通用风格族，按 `tokens.md` 第三节按需推导）

## 版式

无固定版式 —— 通用风格族，版式由 `prompt.md` 第 4 节场景骨架决定。

## Token

```css
:root{
  --bg:#FAFAFA; --surface:#FFFFFF; --surface-2:#F5F5F6;
  --line:#E5E7EB; --line-hover:#D1D5DB;
  --ink:#111827; --ink-soft:#374151; --muted:#6B7280; --faint:#9CA3AF;
  --brand:#111827; --brand-hover:#1F2937; --ring:rgba(17,24,39,.08);
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:12px; --fs-2:13px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:30px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.2; --ls-title:-0.022em;

  --r-xs:6px; --r-sm:8px; --r-md:10px; --r-lg:12px; --r-full:999px;

  --shadow-card:0 1px 2px rgba(16,24,40,.04);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 纯实心墨色。**无渐变、无发光**。hover 变深一档，active 位移 `1px` | 极弱阴影 + `1px` 微边框，几乎不立起 | 线性 `1.5px`，`currentColor`，无背景 | 圆角 `8`，不加滤镜 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 40px |
| 页面标题 | `--fs-6` | 30px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 13px |
| 注脚 / eyebrow | `--fs-1` | 12px |

## 间距密度

极宽。区块间距 `--s-7`~`--s-9`（48/64/96），留白是唯一装饰手段。

---

字号用法与间距密度为使用约定，非参考图实测。
