# tokens.md

六种风格的 token 组。`prompt.md` 第 1 节选定风格后，**必须**从本文件取该风格的具体数值，不得临场编。

三层关系：

```text
通用基础组          间距 / 断点 / 动效 / 无障碍 —— 所有风格共用，不随风格变
        ↓
风格 token 组       颜色组 / 字体组 / 圆角组 / 阴影组 —— 随风格切换
        ↓
落地为 CSS 变量     直接写进 :root，全程只引用变量
```

---

## 一 · 通用基础组（所有风格共用）

| 组 | 值 |
| --- | --- |
| **间距组** | 8pt 栅格：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` |
| **断点组** | `375 / 768 / 1280` |
| **动效组** | 时长 `150–300ms`，缓动 `cubic-bezier(.4, 0, .2, 1)` |
| **无障碍** | 正文对比度 ≥ 4.5:1；点击区 ≥ 44px；尊重 `prefers-reduced-motion` |
| **字号阶梯（全集）** | `12 / 14 / 16 / 20 / 24 / 32 / 40 / 56`，各风格从中取子集 |

```css
/* 通用基础组 —— 每个风格都带上这一段 */
:root{
  --s-1:4px;  --s-2:8px;  --s-3:12px; --s-4:16px; --s-5:24px;
  --s-6:32px; --s-7:48px; --s-8:64px; --s-9:96px;
  --bp-sm:375px; --bp-md:768px; --bp-lg:1280px;
  --dur-fast:150ms; --dur:200ms; --dur-slow:300ms;
  --ease:cubic-bezier(.4,0,.2,1);
}
```

> 以下每个风格只覆盖 **颜色组 / 字体组 / 圆角组 / 阴影组**。

---

## 二 · 六风格 token 组

### 1 · 极简克制 Minimal

**识别特征**：没有卡片、没有阴影、没有彩色主色。层级只由「字号 + 字重 + 灰度」三者构成，任何装饰都是多余的。

| 组 | 值 |
| --- | --- |
| **颜色组** | 底 `#FAFAFA` · 面 `#FFFFFF` · 面2 `#F5F5F6` · 线 `#E5E7EB` · 线悬停 `#D1D5DB` · 主文 `#111827` · 次文 `#374151` · 弱文 `#6B7280` · 极弱 `#9CA3AF` · 主色 `#111827` · 主色悬停 `#1F2937` · 焦点环 `rgba(17,24,39,.08)` · 成功 `#16A34A` · 危险 `#DC2626` · 警告 `#D97706` |
| **字体组** | 族 `-apple-system, "SF Pro Text", Inter, "PingFang SC", sans-serif` · 阶梯 `12/13/14/16/20/30/40` · 字重 `400/500/600` · 行高 正文 `1.6` 标题 `1.2` · 大标题字距 `-0.022em` |
| **圆角组** | `6 / 8 / 10 / 12` + `999` |
| **阴影组** | 基本不用。卡片最多 `0 1px 2px rgba(16,24,40,.04)` |

```css
/* 极简克制 Minimal */
:root{
  /* 颜色组 */
  --bg:#FAFAFA; --surface:#FFFFFF; --surface-2:#F5F5F6;
  --line:#E5E7EB; --line-hover:#D1D5DB;
  --ink:#111827; --ink-soft:#374151; --muted:#6B7280; --faint:#9CA3AF;
  --brand:#111827; --brand-hover:#1F2937; --ring:rgba(17,24,39,.08);
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  /* 字体组 */
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:12px; --fs-2:13px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:30px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.2; --ls-title:-0.022em;

  /* 圆角组 */
  --r-xs:6px; --r-sm:8px; --r-md:10px; --r-lg:12px; --r-full:999px;

  /* 阴影组 */
  --shadow-card:0 1px 2px rgba(16,24,40,.04);
}
```

---

### 2 · 科技暗色 Dark Tech

**识别特征**：深底 + 光斑 + 网格蒙版；玻璃卡靠 `backdrop-filter` 与半透明描边成立；主色只出现在按钮渐变、焦点环和少量高亮上。

| 组 | 值 |
| --- | --- |
| **颜色组** | 底 `#0A0A0B` · 面 `rgba(255,255,255,.035)` · 面2 `rgba(255,255,255,.05)` · 线 `rgba(255,255,255,.09)` · 线强 `rgba(255,255,255,.20)` · 主文 `#F5F5F7` · 次文 `#C9C9D1` · 弱文 `#8B8B94` · 极弱 `#5C5C66` · 主色 `#6D5CFF` · 主色2 `#A855F7` · 光斑A `rgba(109,92,255,.28)` · 光斑B `rgba(168,85,247,.20)` · 成功 `#34D399` · 危险 `#F87171` · 警告 `#FBBF24` |
| **字体组** | 族 同无衬线族（英文建议 Inter）· 阶梯 `11/12/13/14/26/32/40` · 字重 `400/500/600` · 小标签字距 `+0.01em`，全大写标签 `+0.08em` |
| **圆角组** | `8 / 9 / 11 / 18` + `999` |
| **阴影组** | 卡 `inset 0 1px 0 rgba(255,255,255,.07), 0 32px 80px rgba(0,0,0,.6)` · 主按钮 `0 10px 26px rgba(109,92,255,.38)` · 焦点环 `0 0 0 4px rgba(109,92,255,.16)` |

```css
/* 科技暗色 Dark Tech */
:root{
  /* 颜色组 */
  --bg:#0A0A0B; --surface:rgba(255,255,255,.035); --surface-2:rgba(255,255,255,.05);
  --line:rgba(255,255,255,.09); --line-strong:rgba(255,255,255,.20);
  --ink:#F5F5F7; --ink-soft:#C9C9D1; --muted:#8B8B94; --faint:#5C5C66;
  --brand:#6D5CFF; --brand-2:#A855F7; --ring:rgba(109,92,255,.16);
  --glow-a:rgba(109,92,255,.28); --glow-b:rgba(168,85,247,.20);
  --success:#34D399; --danger:#F87171; --warning:#FBBF24;

  /* 字体组 */
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:26px; --fs-6:32px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.2; --ls-label:.08em;

  /* 圆角组 */
  --r-xs:8px; --r-sm:9px; --r-md:11px; --r-lg:18px; --r-full:999px;

  /* 阴影组 */
  --shadow-card:inset 0 1px 0 rgba(255,255,255,.07), 0 32px 80px rgba(0,0,0,.6);
  --shadow-brand:0 10px 26px rgba(109,92,255,.38);
  --blur-glass:blur(24px);
}
```

---

### 3 · 温暖品牌 Warm

**识别特征**：暖白底 + 暖色光斑，白卡大圆角 + 双层暖阴影；主色是低明度的陶土红，按钮做成 pill；整体不出现任何冷灰。

| 组 | 值 |
| --- | --- |
| **颜色组** | 底 `#FFF6F0` · 面 `#FFFFFF` · 面2 `#FFF9F5` · 线 `#F3E3D9` · 主文 `#3A2A22` · 次文 `#6B5548` · 弱文 `#9A8377` · 极弱 `#C0AAA0` · 主色 `#E8674A` · 主色深 `#D4553A` · 强调 `#F4B860` · 焦点环 `rgba(232,103,74,.13)` · 成功 `#4C9A6A` · 危险 `#D64545` · 警告 `#E0A32E` |
| **字体组** | 族 中文 `PingFang SC`；英文可选 Nunito（圆润）· 阶梯 `12/13/14/15/23/26/34` · 字重 `500/600/700`（不用 400 做正文，暖风格靠字重撑起亲和力）· 行高 正文 `1.6` |
| **圆角组** | `8 / 12 / 14 / 20 / 24` + `999`（按钮固定 pill） |
| **阴影组** | 卡 `0 2px 4px rgba(180,120,90,.05), 0 16px 40px rgba(180,120,90,.12)` · 主按钮 `0 8px 20px rgba(232,103,74,.30)` · 悬停 `0 12px 26px rgba(232,103,74,.40)` |

```css
/* 温暖品牌 Warm */
:root{
  /* 颜色组 */
  --bg:#FFF6F0; --surface:#FFFFFF; --surface-2:#FFF9F5;
  --line:#F3E3D9; --line-hover:#EBD2C4;
  --ink:#3A2A22; --ink-soft:#6B5548; --muted:#9A8377; --faint:#C0AAA0;
  --brand:#E8674A; --brand-dark:#D4553A; --accent:#F4B860; --ring:rgba(232,103,74,.13);
  --success:#4C9A6A; --danger:#D64545; --warning:#E0A32E;

  /* 字体组 */
  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:12px; --fs-2:13px; --fs-3:14px; --fs-4:15px; --fs-5:23px; --fs-6:26px; --fs-7:34px;
  --fw-regular:500; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.25;

  /* 圆角组 */
  --r-xs:8px; --r-sm:12px; --r-md:14px; --r-lg:20px; --r-xl:24px; --r-full:999px;

  /* 阴影组 */
  --shadow-card:0 2px 4px rgba(180,120,90,.05), 0 16px 40px rgba(180,120,90,.12);
  --shadow-brand:0 8px 20px rgba(232,103,74,.30);
  --shadow-brand-hover:0 12px 26px rgba(232,103,74,.40);
}
```

---

### 4 · 编辑杂志 Editorial

**识别特征**：靠**版式**而非装饰立风格。衬线大标题 + 强字距对比 + 下划线式输入框 + 近乎无圆角。颜色只有纸色、墨色和一点深红。

| 组 | 值 |
| --- | --- |
| **颜色组** | 纸 `#F4F1EA` · 面 `#FFFFFF` · 线 `#D8D2C4` · 墨 `#1A1712` · 次墨 `#57503F` · 弱墨 `#6B6255` · 极弱 `#8A8171` · 强调（深红）`#B3261E` · 占位 `#B3AB9B` · 成功 `#3F6B4A` · 危险 `#B3261E` · 警告 `#A8761F` |
| **字体组** | 标题族 `"Playfair Display", "Songti SC", Georgia, serif`（衬线，可用 italic）· 正文族 `-apple-system, Inter, "PingFang SC"` · 阶梯 `10.5/12/13/15/34` + 流体大标题 `clamp(46px, 6.4vw, 80px)` · 字重 标题 `600/700`，正文 `400/600` · 行高 大标题 `0.96`、正文 `1.85` · 字距 大写标签 `+0.16~0.26em`、大标题 `-0.022em` |
| **圆角组** | `2` + `999`（几乎无圆角；按钮用 `2px` 方角） |
| **阴影组** | 不用。分区靠 `1px` 线条与纸色/白色块对比 |

```css
/* 编辑杂志 Editorial */
:root{
  /* 颜色组 */
  --paper:#F4F1EA; --surface:#FFFFFF; --line:#D8D2C4;
  --ink:#1A1712; --ink-soft:#57503F; --muted:#6B6255; --faint:#8A8171;
  --accent:#B3261E; --placeholder:#B3AB9B;
  --success:#3F6B4A; --danger:#B3261E; --warning:#A8761F;

  /* 字体组 */
  --font-serif:"Playfair Display","Songti SC",Georgia,"Times New Roman",serif;
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:10.5px; --fs-2:12px; --fs-3:13px; --fs-4:15px; --fs-5:34px;
  --fs-display:clamp(46px, 6.4vw, 80px);
  --fw-regular:400; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.85; --lh-display:.96;
  --ls-label:.16em; --ls-display:-0.022em;

  /* 圆角组 */
  --r-xs:2px; --r-sm:2px; --r-md:2px; --r-full:999px;

  /* 阴影组 */
  --shadow-card:none;
}
```

---

### 5 · 柔和立体 Soft

**识别特征**：**没有边框、没有深色描边**，立体感全部来自双层反向阴影（左上亮 / 右下暗）。输入框是内阴影（凹），按钮是外阴影（凸），按下时翻转为凹。

| 组 | 值 |
| --- | --- |
| **颜色组** | 底 `#EDF0F7` · 阴影亮 `#FFFFFF` · 阴影暗 `#C7CEDF` · 主文 `#3A4160` · 次文 `#5A6386` · 弱文 `#7C85A3` · 极弱 `#9AA3BE` · 主色 `#6C7BFF` · 主色2 `#5A6BFF` · 主色亮 `#8B98FF` · 焦点环 `rgba(108,123,255,.40)` · 成功 `#4FA97A` · 危险 `#E5697A` · 警告 `#E0A94F` |
| **字体组** | 族 同无衬线族 · 阶梯 `11.5/12.5/13.5/14/22/25/32` · 字重 以 `600` 为主（`400` 在柔光底上会显虚）· 行高 正文 `1.6` |
| **圆角组** | `10 / 14 / 19 / 22 / 26` + `999`（整体偏大，圆角是柔感的来源） |
| **阴影组** | 凸起 `-10px -10px 24px #FFFFFF, 12px 12px 28px #C7CEDF` · 凹陷 `inset 3px 3px 7px #C7CEDF, inset -3px -3px 7px #FFFFFF` · 按钮 `5px 5px 12px #C7CEDF, -4px -4px 10px #FFFFFF` |

```css
/* 柔和立体 Soft */
:root{
  /* 颜色组 */
  --bg:#EDF0F7; --sh-light:#FFFFFF; --sh-dark:#C7CEDF;
  --ink:#3A4160; --ink-soft:#5A6386; --muted:#7C85A3; --faint:#9AA3BE;
  --brand:#6C7BFF; --brand-2:#5A6BFF; --brand-light:#8B98FF; --ring:rgba(108,123,255,.40);
  --success:#4FA97A; --danger:#E5697A; --warning:#E0A94F;

  /* 字体组 */
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11.5px; --fs-2:12.5px; --fs-3:13.5px; --fs-4:14px; --fs-5:22px; --fs-6:25px; --fs-7:32px;
  --fw-regular:500; --fw-medium:600; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.25;

  /* 圆角组 */
  --r-xs:10px; --r-sm:14px; --r-md:19px; --r-lg:22px; --r-xl:26px; --r-full:999px;

  /* 阴影组 */
  --shadow-raised:-10px -10px 24px var(--sh-light), 12px 12px 28px var(--sh-dark);
  --shadow-inset:inset 3px 3px 7px var(--sh-dark), inset -3px -3px 7px var(--sh-light);
  --shadow-brand:5px 5px 12px var(--sh-dark), -4px -4px 10px var(--sh-light);
  --shadow-brand-active:inset 4px 4px 9px rgba(45,55,140,.5), inset -3px -3px 8px rgba(255,255,255,.28);
}
```

---

### 6 · 大胆撞色 Bold

**识别特征**：**硬阴影（零模糊）+ 3px 粗黑描边**是全部识别度的来源。hover 向左上位移、active 向右下压入，位移量等于阴影偏移量的变化。

| 组 | 值 |
| --- | --- |
| **颜色组** | 底 `#FFD93D` · 面 `#FFFFFF` · 面2 `#FFFCF0` · 描边/文字 `#111111` · 次文 `#3D3D3D` · 弱文 `#6B6B6B` · 强调（粉）`#FF5C8A` · 占位 `#9B9B9B` · 成功 `#16A34A` · 危险 `#E5342C` · 警告 `#FF9500` |
| **字体组** | 族 同无衬线族 · 阶梯 `11.5/12/13/13.5/16/32/38` · 字重 `600/700/800`（标题与按钮固定 `800`）· 大写标签字距 `+0.10em` · 行高 标题 `1.04` |
| **圆角组** | `12 / 14 / 16 / 24` + `999` |
| **阴影组** | 硬阴影，**零模糊**：`4px 4px 0 #111`（小）/ `6px 6px 0 #FF5C8A`（主按钮）/ `10px 10px 0 #111`（卡片） |
| **描边组** | 固定 `3px solid #111111`（这是本风格的骨架，不可省） |

```css
/* 大胆撞色 Bold */
:root{
  /* 颜色组 */
  --bg:#FFD93D; --surface:#FFFFFF; --surface-2:#FFFCF0;
  --ink:#111111; --ink-soft:#3D3D3D; --muted:#6B6B6B; --placeholder:#9B9B9B;
  --accent:#FF5C8A;
  --success:#16A34A; --danger:#E5342C; --warning:#FF9500;

  /* 字体组 */
  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11.5px; --fs-2:12px; --fs-3:13px; --fs-4:13.5px; --fs-5:16px; --fs-6:32px; --fs-7:38px;
  --fw-regular:600; --fw-medium:700; --fw-semibold:800;
  --lh-body:1.6; --lh-title:1.04; --ls-label:.10em;

  /* 圆角组 */
  --r-xs:12px; --r-sm:14px; --r-md:16px; --r-lg:24px; --r-full:999px;

  /* 描边组 */
  --stroke:3px solid var(--ink);

  /* 阴影组 —— 硬阴影，零模糊 */
  --shadow-sm:4px 4px 0 var(--ink);
  --shadow-brand:6px 6px 0 var(--accent);
  --shadow-brand-hover:8px 8px 0 var(--accent);
  --shadow-brand-active:2px 2px 0 var(--accent);
  --shadow-card:10px 10px 0 var(--ink);
}
```

---

## 三 · 使用规则

1. **先选风格，再取 token**。风格未确认前不要动 token。
2. **取用顺序**：通用基础组 → 该风格四组 → 写进 `:root` → 之后所有样式只引用变量，**不得再出现字面色值**。
3. **跨风格不得混用**。例如不能把 Warm 的 `--r-xl:24px` 配 Dark Tech 的颜色组——识别特征来自四组的一致性。
4. **风格特征优先于通用审美**。若通用规则（如"卡片要有阴影"）与风格特征冲突，以风格特征为准，并在交付时说明。
5. **新增风格**：按同样四组（颜色 / 字体 / 圆角 / 阴影）补齐，缺组视为未定义，不得交付。
