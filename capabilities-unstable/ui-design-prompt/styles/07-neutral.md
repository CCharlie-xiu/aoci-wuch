# 07 · 中性留白 Neutral

近黑中性色 + 白卡大留白 + 圆形悬浮按钮。零彩色主色——主色即墨色，层级全靠字号、字重与留白。

## 来源

- 参考 `Dribbble · Travel Mobile App（Ronas IT）`
- 实测 底 `#D7D9DB`~`#F5F6F7` · 屏 `#FDFEFE` · 墨 `#181719` · 纯黑钮 `#030303` · 中灰 `#A1AEB2`
- 推导 字体、阴影、字号、圆角 —— 非实测
- 圆角 R=`16`（形态锚点判断，非实测），按 `tokens.md` 第三节展开

## 版式

发现页（问候 + 搜索 + 分类 chip + 主推大卡 + 悬浮 tabbar）/ 目的地详情（满幅头图 + 上浮 sheet + 行程卡横滑）/ 行程详情（分段控件 + 可折叠 Day 卡 + 底部主按钮）。

## Token

```css
:root{
  --bg:#F4F4F6; --surface:#FFFFFF; --surface-2:#EFEFF2;
  --line:rgba(22,22,26,.08); --line-strong:rgba(22,22,26,.16);
  --ink:#16161A; --ink-soft:#5C5C64; --muted:#8E8E96; --faint:#B8B8C0;
  --brand:#16161A; --brand-hover:#26262C; --ring:rgba(22,22,26,.10);
  --success:#2FA05C; --danger:#D64545; --warning:#D08A1E;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:18px; --fs-6:21px; --fs-7:26px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.22; --ls-title:-0.025em;

  --r-xs:8px; --r-sm:11px; --r-md:16px; --r-lg:22px; --r-xl:28px; --r-full:999px;

  --shadow-card:0 1px 2px rgba(22,22,26,.04), 0 10px 24px -8px rgba(22,22,26,.10);
  --shadow-float:0 4px 16px rgba(22,22,26,.10), 0 12px 32px -12px rgba(22,22,26,.18);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 近黑实心 pill，**无渐变无发光**。hover 变深一档 | 白面 + 极弱双层阴影，**无描边**，圆角 `22` | 线性 `1.75px`，`#B8B8C0`，选中态转 `#16161A` | 圆角 `16`，图上标题叠暗色遮罩 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 26px |
| 页面标题 | `--fs-6` | 21px |
| 区块标题 | `--fs-5` | 18px |
| 卡标题 / 强调 | `--fs-4` | 16px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

宽。区块 `--s-6`~`--s-7`（32/48），卡内 `--s-4`（16）。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
