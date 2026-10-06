# 12 · 彩色拟态 Chroma

浅青蓝底 + 双向阴影凸起，彩色渐变数据条是识别度

## 来源

- 来源 `Dribbble · Fitness neumorphism`
- 实测 底 `#E3F0F9`（26%）/ `#D4E6F2`（20%）· 阴影侧 `#BFD6E8` · 深色点缀 `#7578B2`（2%）
- 推导 渐变数据条色、语义色、圆角、字号 —— 按 `tokens.md` 第三节推导；参考图以浅青蓝为主，**无大面积紫**
- 圆角 R=`20`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 无衬线，标签宽字距（`.10em`）

## 版式

双设备卡并置 → 环形进度 + 四色渐变数据柱 + 底部图标栏。

## Token

```css
:root{
  --bg:#E3F0F9; --surface:#E7F2FA; --surface-2:#EDF5FB; --sh-light:#FFFFFF; --sh-dark:#BFD6E8;
  --line:rgba(63,90,120,.10);
  --ink:#4A5A72; --ink-soft:#6B7D96; --muted:#8B9DB5; --faint:#AEC0D4;
  --brand:#5A6FD8; --brand-2:#3FBEE0; --brand-3:#E8709E; --ring:rgba(90,111,216,.32);
  --success:#4FA97A; --danger:#E5697A; --warning:#E8A64F;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:13.5px; --fs-4:15px; --fs-5:20px; --fs-6:24px; --fs-7:30px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.25; --ls-label:.10em;

  --r-xs:10px; --r-sm:14px; --r-md:20px; --r-lg:28px; --r-xl:36px; --r-full:999px;

  --shadow-card:-8px -8px 20px var(--sh-light), 10px 10px 24px var(--sh-dark); --shadow-inset:inset 3px 3px 7px var(--sh-dark), inset -3px -3px 7px var(--sh-light); --shadow-brand:6px 6px 14px var(--sh-dark), -5px -5px 12px var(--sh-light);
  --grad-data:linear-gradient(180deg,#3FBEE0,#5A6FD8 55%,#E8709E);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 双向立体：外阴影凸起，按下转 `inset`。**禁止发光** | 同色底 + 双向反向阴影，**禁止边框** | 线性 `1.75px`，与主色同色系 | 圆角 `16`，叠内阴影 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 30px |
| 页面标题 | `--fs-6` | 24px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 13.5px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

中。区块 `--s-5`（24），卡内 `--s-4`（16）。

---

字号用法与间距密度为使用约定，非参考图实测。
