# 10 · 图谱暗绿 Graph

墨绿近黑底 + 发光节点 + 玻璃面板 + 发丝连线，数据密集

## 来源

- 来源 `Dribbble · AI Dashboard Design for Control AI Policy Platform`
- 实测 底 `#111B1E` / `#0C1417` · 面板 `#19292B` · 高亮面 `#273D3E` · 最暗 `#010101`（面积 12%）
- 推导 **发光色、语义色、字号、圆角、阴影为推导** —— 参考图中发光节点面积过小，未进入调色板
- 圆角 R=`12`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线 + 等宽数字（`SF Mono` 系）

## 版式

左侧节点画布（中心节点 + 辐射连线）→ 右侧堆叠信息卡 → 底部输入条。

## Token

```css
:root{
  --bg:#0C1417; --surface:#19292B; --surface-2:#203234;
  --line:rgba(255,255,255,.08); --line-hover:rgba(255,255,255,.22);
  --ink:#E6EFEC; --ink-soft:#9FB3AE; --muted:#6E8380; --faint:#48595A;
  --brand:#8B6BF0; --brand-2:#2DD4BF; --ring:rgba(139,107,240,.20); --glow:rgba(139,107,240,.35);
  --success:#34D399; --danger:#F87171; --warning:#FBBF24;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:10.5px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:18px; --fs-6:22px; --fs-7:30px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.2; --ls-label:.08em;

  --r-xs:6px; --r-sm:8px; --r-md:12px; --r-lg:17px; --r-xl:22px; --r-full:999px;

  --shadow-card:inset 0 1px 0 rgba(255,255,255,.06), 0 24px 60px rgba(0,0,0,.6); --shadow-brand:0 0 24px rgba(139,107,240,.45); --blur-glass:blur(20px);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 紫色实心 + 同色发光，**不用渐变** | 玻璃 `blur(20px)` + `1px` 半透明描边 + inset 顶部高光 | 线性 `1.75px`，`#9FB3AE`，激活转紫 | 圆角 `12`，叠深色遮罩压亮度 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 30px |
| 页面标题 | `--fs-6` | 22px |
| 区块标题 | `--fs-5` | 18px |
| 卡标题 / 强调 | `--fs-4` | 14px |
| 正文 | `--fs-3` | 13px |
| 次要文字 / 标签 | `--fs-2` | 12px |
| 注脚 / eyebrow | `--fs-1` | 10.5px |

## 间距密度

紧。区块 `--s-4`（16），卡内 `--s-3`（12）；信息密度是这款的特征。

---

字号用法与间距密度为使用约定，非参考图实测。
