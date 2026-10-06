# 03 · 温暖品牌 Warm

暖白底 + 暖色光斑。白卡大圆角 + 双层暖阴影，主色为低明度陶土红，按钮 pill，全程无冷灰。

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
  --bg:#FFF6F0; --surface:#FFFFFF; --surface-2:#FFF9F5;
  --line:#F3E3D9; --line-hover:#EBD2C4;
  --ink:#3A2A22; --ink-soft:#6B5548; --muted:#9A8377; --faint:#C0AAA0;
  --brand:#E8674A; --brand-dark:#D4553A; --accent:#F4B860; --ring:rgba(232,103,74,.13);
  --success:#4C9A6A; --danger:#D64545; --warning:#E0A32E;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:12px; --fs-2:13px; --fs-3:14px; --fs-4:15px; --fs-5:23px; --fs-6:26px; --fs-7:34px;
  --fw-regular:500; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.25;

  --r-xs:8px; --r-sm:12px; --r-md:14px; --r-lg:20px; --r-xl:24px; --r-full:999px;

  --shadow-card:0 2px 4px rgba(180,120,90,.05), 0 16px 40px rgba(180,120,90,.12);
  --shadow-brand:0 8px 20px rgba(232,103,74,.30);
  --shadow-brand-hover:0 12px 26px rgba(232,103,74,.40);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| pill 实心主色 + **暖色柔和发光** `0 8px 20px rgba(232,103,74,.30)`。**不用渐变** | 大圆角 `24` + 双层暖阴影，**无描边** | 线性 `1.75px`，圆端点 | 圆角 `20`，轻微暖调 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 34px |
| 页面标题 | `--fs-6` | 26px |
| 区块标题 | `--fs-5` | 23px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 13px |
| 注脚 / eyebrow | `--fs-1` | 12px |

## 间距密度

宽。区块 `--s-7`（48），卡内 `--s-5`（24）；大圆角需要留白托住。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
