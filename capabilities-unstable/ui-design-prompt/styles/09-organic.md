# 09 · 疗愈有机 Organic

米白 + 暖褐摄影，衬线大标题，圆形细线图标，全靠 1px 细线分区

## 来源

- 来源 `Dribbble · Healance Mental Health Platform Web Design`
- 实测 底 `#FBF9F5`（46%）· 暗 `#221E1A`（20%）· 中间调 `#71695C` / `#4E4235` · 分隔线 `#CFCFCE`
- 推导 主色、圆角、阴影、字号阶梯 —— 按 `tokens.md` 第三节推导，非实测
- 圆角 R=`16`（形态锚点判断，非实测），按 `tokens.md` 第三节展开
- 字体 衬线大标题（`Songti SC` 系）+ 无衬线正文

## 版式

左文右图 Hero → 圆形细线图标 2×2 服务网格 → 引述块，全程细线分区。

## Token

```css
:root{
  --bg:#FBF9F5; --surface:#FFFFFF; --surface-2:#F2F0EA;
  --line:#CFCFCE; --line-hover:#B4B0A6;
  --ink:#221E1A; --ink-soft:#4E4235; --muted:#71695C; --faint:#A78B6A;
  --brand:#221E1A; --brand-hover:#3A342C; --ring:rgba(34,30,26,.12); --accent:#E3DFD9;
  --success:#4E5A45; --danger:#8E4436; --warning:#9A7530;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:"Songti SC",Georgia,"Times New Roman",serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:15px; --fs-5:20px; --fs-6:30px; --fs-7:44px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.7; --lh-title:1.18; --ls-title:-0.015em;

  --r-xs:8px; --r-sm:11px; --r-md:16px; --r-lg:22px; --r-xl:29px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

## 质感

| 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- |
| 深墨或米色 pill，**无渐变无发光** | 白面 + `1px` 细线，圆角 `16`，**无阴影** | 线性 `1.5px`，`#4E4235`，外裹圆形细线徽章 | 圆角 `16`，暖调压暗 |

## 字号用法

| 用途 | 级 | 值 |
| --- | --- | --- |
| 展示标题 / Hero | `--fs-7` | 44px |
| 页面标题 | `--fs-6` | 30px |
| 区块标题 | `--fs-5` | 20px |
| 卡标题 / 强调 | `--fs-4` | 15px |
| 正文 | `--fs-3` | 14px |
| 次要文字 / 标签 | `--fs-2` | 12.5px |
| 注脚 / eyebrow | `--fs-1` | 11px |

## 间距密度

宽。区块 `--s-7`（48），正文行高 `1.7`；细线分区不需要额外留白。

---

字号用法与间距密度为使用约定，非参考图实测。

本文件的 token 受 `baseline.md` 约束 —— 圆角分档、容器与背景、颜色四角色、
渐变边界、字体规范、图标规范六条一律以 `baseline.md` 为准。
