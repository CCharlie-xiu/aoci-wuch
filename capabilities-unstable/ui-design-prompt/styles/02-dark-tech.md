# 02 · 科技暗色 Dark Tech

深底 + 光斑 + 网格蒙版。玻璃卡靠 `backdrop-filter` 与半透明描边成立。

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
  --bg:#0A0A0B; --surface:rgba(255,255,255,.035); --surface-2:rgba(255,255,255,.05);
  --line:rgba(255,255,255,.09); --line-strong:rgba(255,255,255,.20);
  --ink:#F5F5F7; --ink-soft:#C9C9D1; --muted:#8B8B94; --faint:#5C5C66;
  --brand:#6D5CFF; --brand-2:#A855F7; --ring:rgba(109,92,255,.16);
  --glow-a:rgba(109,92,255,.28); --glow-b:rgba(168,85,247,.20);
  --success:#34D399; --danger:#F87171; --warning:#FBBF24;

  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:26px; --fs-6:32px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.2; --ls-label:.08em;

  --r-xs:8px; --r-sm:9px; --r-md:11px; --r-lg:18px; --r-full:999px;

  --shadow-card:inset 0 1px 0 rgba(255,255,255,.07), 0 32px 80px rgba(0,0,0,.6);
  --shadow-brand:0 10px 26px rgba(109,92,255,.38);
  --blur-glass:blur(24px);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 渐变 `135°` 主色→主色2 + **同色发光** `0 10px 26px rgba(109,92,255,.38)` | 玻璃 `blur(24px)` + `1px` 半透明描边 + inset 顶部高光 | 线性 `1.75px`，`#C9C9D1` | 圆角 `12`，叠暗色遮罩压亮度 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 40px |
| 页面标题 | `--fs-6` | 32px |
| 区块标题 | `--fs-5` | 26px |
| 卡标题 / 强调 | `--fs-4` | 14px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 12px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

中。区块 `--s-6`（32），卡内 `--s-4`~`--s-5`；数据密集区可收紧到 `--s-3`。

---

字号用法与间距密度为使用约定，非参考图实测。
