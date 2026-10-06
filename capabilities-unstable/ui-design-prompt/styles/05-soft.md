# 05 · 柔和立体 Soft

无边框、无描边。立体感全部来自双层反向阴影（左上亮 / 右下暗）。输入框内阴影，按钮外阴影，按下翻转为凹。

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
  --bg:#EDF0F7; --sh-light:#FFFFFF; --sh-dark:#C7CEDF;
  --ink:#3A4160; --ink-soft:#5A6386; --muted:#7C85A3; --faint:#9AA3BE;
  --brand:#6C7BFF; --brand-2:#5A6BFF; --brand-light:#8B98FF; --ring:rgba(108,123,255,.40);
  --success:#4FA97A; --danger:#E5697A; --warning:#E0A94F;

  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11.5px; --fs-2:12.5px; --fs-3:13.5px; --fs-4:14px; --fs-5:22px; --fs-6:25px; --fs-7:32px;
  --fw-regular:500; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.25;

  --r-xs:10px; --r-sm:14px; --r-md:19px; --r-lg:22px; --r-xl:26px; --r-full:999px;

  --shadow-raised:-10px -10px 24px var(--sh-light), 12px 12px 28px var(--sh-dark);
  --shadow-inset:inset 3px 3px 7px var(--sh-dark), inset -3px -3px 7px var(--sh-light);
  --shadow-brand:5px 5px 12px var(--sh-dark), -4px -4px 10px var(--sh-light);
  --shadow-brand-active:inset 4px 4px 9px rgba(45,55,140,.5), inset -3px -3px 8px rgba(255,255,255,.28);
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 双向立体：外阴影凸起，按下转 `inset`。**禁止发光** | 同色底 + 双层反向阴影，**禁止边框** | 线性 `1.75px`，与主色同色系 | 圆角 `16`，叠内阴影 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 32px |
| 页面标题 | `--fs-6` | 25px |
| 区块标题 | `--fs-5` | 22px |
| 卡标题 / 强调 | `--fs-4` | 14px |
| 正文 | `--fs-3` | 13.5px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11.5px |

## 间距密度

中。区块 `--s-6`（32），卡内 `--s-5`（24）；双向阴影之间需要呼吸。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
