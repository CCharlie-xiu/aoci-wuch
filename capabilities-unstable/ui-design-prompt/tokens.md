# tokens.md

`prompt.md` 第 1 节确认风格后，从本文件取值。

```text
一 · 通用基础组     间距 / 断点 / 动效 / 无障碍 —— 全风格共用
二 · 18 风格 token   颜色 / 字体 / 圆角 / 阴影 —— 可整组套用，也可拆组搭配
二·补 · 质感组      第五组：按钮 / 卡片 / 图标 / 图片
三 · 自定义风格     菜单外风格的推导流程
三·补 · 组合用法     跨款搭配的绑定关系与一致性检查
四 · 使用规则
```

落地形态一律为 CSS 变量，写进 `:root`，全程只引用变量。

**风格不是单选锁定项，是可复用的规范组。** 一次设计可只取一款，也可从多款各取所需。

---

## 一 · 通用基础组

| 组 | 值 |
| --- | --- |
| 间距 | `4/8/12/16/24/32/48/64/96` |
| 断点 | `375 / 768 / 1280` |
| 动效 | `150–300ms`，`cubic-bezier(.4,0,.2,1)` |
| 无障碍 | 对比度 ≥ 4.5:1；点击区 ≥ 44px；`prefers-reduced-motion` |
| 字号全集 | `12/14/16/20/24/32/40/56`，各风格取子集 |

```css
:root{
  --s-1:4px;  --s-2:8px;  --s-3:12px; --s-4:16px; --s-5:24px;
  --s-6:32px; --s-7:48px; --s-8:64px; --s-9:96px;
  --bp-sm:375px; --bp-md:768px; --bp-lg:1280px;
  --dur-fast:150ms; --dur:200ms; --dur-slow:300ms;
  --ease:cubic-bezier(.4,0,.2,1);
}
```

---

## 二 · 18 风格 token

每款只覆盖 **颜色 / 字体 / 圆角 / 阴影** 四组，质感组见下一节。

18 款互为可复用的规范组，不存在"只能用一款"的限制，搭配规则见三·补。

### 1 · 极简克制 Minimal

无卡片、无阴影、无彩色主色。层级只靠字号 + 字重 + 灰度。

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

### 2 · 科技暗色 Dark Tech

深底 + 光斑 + 网格蒙版。玻璃卡靠 `backdrop-filter` 与半透明描边成立。

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

### 3 · 温暖品牌 Warm

暖白底 + 暖色光斑。白卡大圆角 + 双层暖阴影，主色为低明度陶土红，按钮 pill，全程无冷灰。

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

### 4 · 编辑杂志 Editorial

靠版式而非装饰立风格。衬线大标题 + 强字距对比 + 下划线输入框 + 近乎无圆角。

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

### 5 · 柔和立体 Soft

无边框、无描边。立体感全部来自双层反向阴影（左上亮 / 右下暗）。输入框内阴影，按钮外阴影，按下翻转为凹。

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

### 6 · 大胆撞色 Bold

硬阴影（零模糊）+ 3px 粗黑描边是全部识别度。hover 向左上位移，active 向右下压入。

```css
:root{
  --bg:#FFD93D; --surface:#FFFFFF; --surface-2:#FFFCF0;
  --ink:#111111; --ink-soft:#3D3D3D; --muted:#6B6B6B; --placeholder:#9B9B9B;
  --accent:#FF5C8A;
  --success:#16A34A; --danger:#E5342C; --warning:#FF9500;

  --font:-apple-system,"SF Pro Text",Inter,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11.5px; --fs-2:12px; --fs-3:13px; --fs-4:13.5px; --fs-5:16px; --fs-6:32px; --fs-7:38px;
  --fw-regular:600; --fw-medium:700; --fw-semibold:800;
  --lh-body:1.6; --lh-title:1.04; --ls-label:.10em;

  --r-xs:12px; --r-sm:14px; --r-md:16px; --r-lg:24px; --r-full:999px;

  --stroke:3px solid var(--ink);

  --shadow-sm:4px 4px 0 var(--ink);
  --shadow-brand:6px 6px 0 var(--accent);
  --shadow-brand-hover:8px 8px 0 var(--accent);
  --shadow-brand-active:2px 2px 0 var(--accent);
  --shadow-card:10px 10px 0 var(--ink);
}
```

### 7 · 中性留白 Neutral

近黑中性色 + 白卡大留白 + 圆形悬浮按钮。零彩色主色——主色即墨色，层级全靠字号、字重与留白。

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

### 8 · 自然生态 Eco

奶油白底 + 橄榄绿 + 满幅自然摄影，浅绿胶囊按钮，方角卡片

- 来源 `Dribbble · Earth Day Brand Recognition（Sustainable Web Design）`
- 实测 底 `#EEEDE9` · 暗 `#191B1A` · 中间调 `#555D4F` / `#34382E` · 最高饱和 `#474D26`（S.50 / 10%）
- 推导 主色、面、线、语义色、圆角、字体、阴影 —— 按本文件第三节规则推导，非实测
- 版式 满幅摄影 Hero（大标题叠压）→ 方角三栏卡 → 深色 CTA 段
- 字体 无衬线正文 + 衬线斜体强调词（`Songti SC` 系）
- 圆角 R=`4`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#EEEDE9; --surface:#F8F7F3; --surface-2:#E1E0D9;
  --line:#D2D0C5; --line-hover:#B9B7A8;
  --ink:#191B1A; --ink-soft:#34382E; --muted:#555D4F; --faint:#8A8F7C;
  --brand:#C6DE7A; --brand-hover:#D4E894; --brand-ink:#191B1A; --deep:#1F231E; --ring:rgba(31,35,30,.16);
  --success:#474D26; --danger:#9C4A38; --warning:#B08A3A;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:"Songti SC",Georgia,"Times New Roman",serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:22px; --fs-6:34px; --fs-7:56px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.65; --lh-title:1.12; --ls-title:-0.02em;

  --r-xs:2px; --r-sm:3px; --r-md:4px; --r-lg:6px; --r-xl:7px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

### 9 · 疗愈有机 Organic

米白 + 暖褐摄影，衬线大标题，圆形细线图标，全靠 1px 细线分区

- 来源 `Dribbble · Healance Mental Health Platform Web Design`
- 实测 底 `#FBF9F5`（46%）· 暗 `#221E1A`（20%）· 中间调 `#71695C` / `#4E4235` · 分隔线 `#CFCFCE`
- 推导 主色、圆角、阴影、字号阶梯 —— 按第三节推导，非实测
- 版式 左文右图 Hero → 圆形细线图标 2×2 服务网格 → 引述块，全程细线分区
- 字体 衬线大标题（`Songti SC` 系）+ 无衬线正文
- 圆角 R=`16`（形态锚点判断，非实测），按第三节展开

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

### 10 · 图谱暗绿 Graph

墨绿近黑底 + 发光节点 + 玻璃面板 + 发丝连线，数据密集

- 来源 `Dribbble · AI Dashboard Design for Control AI Policy Platform`
- 实测 底 `#111B1E` / `#0C1417` · 面板 `#19292B` · 高亮面 `#273D3E` · 最暗 `#010101`（面积 12%）
- 推导 **发光色、语义色、字号、圆角、阴影为推导** —— 参考图中发光节点面积过小，未进入调色板
- 版式 左侧节点画布（中心节点 + 辐射连线）→ 右侧堆叠信息卡 → 底部输入条
- 字体 无衬线 + 等宽数字（`SF Mono` 系）
- 圆角 R=`12`（形态锚点判断，非实测），按第三节展开

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

### 11 · 网格渐变 Mesh

白底 + 大面积极柔网格光斑，零边框零阴影，按钮反而用纯色

- 来源 `Dribbble · Appinio Gradients`
- 实测 底 `#FBFBFB`（31%）· 蓝 `#344CC8`（S.74）· 橙 `#F16748` · 淡紫 `#DFE4F9` / `#C9D1F9`
- 推导 圆角、字号、语义色 —— 按第三节推导；光斑位置为示意，非实测坐标
- 版式 居中大标题 + 极柔网格光斑背景 → 纯色主按钮 → 三栏小字
- 字体 无衬线，字距收紧（`-0.025em`）
- 圆角 R=`20`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#FBFBFB; --surface:#FFFFFF; --surface-2:#F4F4F7;
  --line:rgba(17,17,20,.06); --line-hover:rgba(17,17,20,.14);
  --ink:#17171A; --ink-soft:#5A5A62; --muted:#93939C; --faint:#C2C2CA;
  --brand:#344CC8; --brand-2:#F16748; --ring:rgba(52,76,200,.16);
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:28px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.65; --lh-title:1.18; --ls-title:-0.025em;

  --r-xs:10px; --r-sm:14px; --r-md:20px; --r-lg:28px; --r-xl:36px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
  --mesh-a:#F16748; --mesh-b:#344CC8; --mesh-c:#DFE4F9;
}
```

### 12 · 彩色拟态 Chroma

浅青蓝底 + 双向阴影凸起，彩色渐变数据条是识别度

- 来源 `Dribbble · Fitness neumorphism`
- 实测 底 `#E3F0F9`（26%）/ `#D4E6F2`（20%）· 阴影侧 `#BFD6E8` · 深色点缀 `#7578B2`（2%）
- 推导 渐变数据条色、语义色、圆角、字号 —— 按第三节推导；参考图以浅青蓝为主，**无大面积紫**
- 版式 双设备卡并置 → 环形进度 + 四色渐变数据柱 + 底部图标栏
- 字体 无衬线，标签宽字距（`.10em`）
- 圆角 R=`20`（形态锚点判断，非实测），按第三节展开

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

### 13 · 巨型排版 Gigatype

超大背景字 + 单一高饱和圆形色块 + 产品图叠压，导航极简

- 来源 `Dribbble · Adidas Neumorphism Landing Page`
- 实测 底 `#EDECF0`（32%）/ `#EAEBEF`（16%）· 主色 `#E45641`（S.71 / 9%）· 浅色同系 `#FA916B`（8%）
- 推导 字级（含超大号）、圆角、阴影 —— 按第三节推导；**背景字字号为示意**，参考图字高约占画布 45%
- 版式 极简导航 → 超大背景字 + 单一高饱和圆 + 产品图叠压 → 圆形翻页钮 + 缩略图角标
- 字体 无衬线超粗标题，行高压到 `0.94`
- 圆角 R=`14`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#EDECF0; --surface:#F4F4F7; --surface-2:#E5E6EC;
  --line:rgba(17,17,20,.08); --line-hover:rgba(17,17,20,.16);
  --ink:#111114; --ink-soft:#4A4A52; --muted:#8C8C94; --faint:#B8B8C0;
  --brand:#E45641; --brand-hover:#EF6C58; --ring:rgba(228,86,65,.18); --ghost:#E8AB97;
  --success:#16A34A; --danger:#DC2626; --warning:#D97706;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:40px; --fs-7:96px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:0.94; --ls-title:-0.04em;

  --r-xs:7px; --r-sm:10px; --r-md:14px; --r-lg:20px; --r-xl:25px; --r-full:999px;

  --shadow-card:0 24px 60px -24px rgba(17,17,20,.28); --shadow-brand:0 12px 28px -8px rgba(228,86,65,.40);
}
```

### 14 · 野兽派 Brutalist

高饱和纯黄 + 近黑块 + 零圆角零阴影，粗黑字与手绘装饰

- 来源 `Dribbble · Kool Boys Ski & Snowboard Event Website`
- 实测 黄 `#FEE300`（S=1.00 / 16%）· 纯黑 `#000000`（19%）· 照片冷调 `#355E70` / `#899DAB`
- 推导 语义色、字号、字体族 —— 按第三节推导；**黄为实测，我原先写的 `#F2DF1B` 偏金，已修正**
- 版式 亮黄头版（导航 + 满幅照片 + 左粗标题右小字）→ 近黑正文段（居中大字 + 方块按钮）
- 字体 超粗无衬线标题（字重 `800`）+ 常规正文
- 圆角 R=`2`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#FEE300; --surface:#FEE300; --surface-2:#F0D500;
  --line:#0A0A0A; --line-hover:#2A2A20;
  --ink:#0A0A0A; --ink-soft:#2A2A20; --muted:#6B6B3F; --faint:#A8A86E; --ink-inv:#F5F5F0;
  --block:#0A0A0A; --brand:#0A0A0A; --brand-hover:#2A2A20; --ring:rgba(10,10,10,.20); --accent:#FF3B8D;
  --success:#0A0A0A; --danger:#D8332A; --warning:#B07A10;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:16px; --fs-5:20px; --fs-6:34px; --fs-7:52px;
  --fw-regular:400; --fw-medium:600; --fw-semibold:800;
  --lh-body:1.55; --lh-title:0.98; --ls-title:-0.03em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

### 15 · 噪点暗红 Noise

近黑底 + 玫粉 + 位图噪点 + 印刷错位，等宽字为主

- 来源 `Dribbble · Monolith Dark Bold Brutalist Music Record Label`
- 实测 底 `#080808`（33%）· 玫粉 `#E94E79`（S.66 / 20%）· 亮粉 `#EA80A6` · 暗红 `#742F42`
- 推导 噪点纹理、错位量、圆角、字号 —— 按第三节推导；**粉为实测，我原先写的 `#FF2D78` 过饱和，已修正**
- 版式 左大标题块（错位叠印）→ 右侧编号卡网格 → 等宽编号标签贯穿
- 字体 等宽字为主（`SF Mono` 系），标题用方角位图气质
- 圆角 R=`2`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#080808; --surface:#141414; --surface-2:#1C1C1C;
  --line:rgba(255,255,255,.10); --line-hover:rgba(233,78,121,.55);
  --ink:#F2F2F2; --ink-soft:#A8A8A8; --muted:#7A7A7A; --faint:#4A4A4A;
  --brand:#E94E79; --brand-2:#EA80A6; --ring:rgba(233,78,121,.30);
  --success:#3FBF7F; --danger:#E94E79; --warning:#D9A94D;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:10.5px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:18px; --fs-6:26px; --fs-7:38px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:700;
  --lh-body:1.6; --lh-title:1.05; --ls-label:.12em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:0 0 0 1px rgba(255,255,255,.08); --shadow-brand:0 0 28px rgba(233,78,121,.45);
}
```

### 16 · 液态铬 Chrome

近黑底 + 铬合金渐变面 + 镜面高光 + 大圆角

- 来源 `Dribbble · 3D Illustration System`
- 实测 底 `#090A0D`（61%）· 铬面 `#DFE2EA` / `#A5AEC2` / `#434C6C` · 高光 `#2D3043`
- 推导 主色、圆角、字号 —— 按第三节推导；**参考图无蓝色主色**，我原先写的 `#6E8BFF` 无依据，已改为按实测铬面中调取蓝灰
- 版式 顶部横排 5 张铬面图标卡 → 下方大铬面圆环 + 右侧说明文字
- 字体 无衬线 + 等宽数字
- 圆角 R=`20`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#090A0D; --surface:#111219; --surface-2:#1D1C28;
  --line:rgba(255,255,255,.10); --line-hover:rgba(255,255,255,.24);
  --ink:#E8EAF0; --ink-soft:#A5AEC2; --muted:#75798A; --faint:#4A4D5C;
  --brand:#434C6C; --brand-hover:#54608A; --brand-ink:#E8EAF0; --ring:rgba(67,76,108,.40);
  --success:#4FA97A; --danger:#D96A6A; --warning:#D9B24D;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:11px; --fs-2:12.5px; --fs-3:14px; --fs-4:15px; --fs-5:20px; --fs-6:26px; --fs-7:36px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.6; --lh-title:1.15; --ls-title:-0.02em;

  --r-xs:10px; --r-sm:14px; --r-md:20px; --r-lg:28px; --r-xl:36px; --r-full:999px;

  --shadow-card:inset 0 1px 0 rgba(255,255,255,.10), 0 30px 70px rgba(0,0,0,.7); --shadow-brand:0 0 32px rgba(67,76,108,.55);
  --chrome:linear-gradient(135deg,#F2F4F8 0%,#B6BFD2 16%,#3A4356 36%,#DDE2EC 52%,#7D879C 68%,#22262F 84%,#EDF0F6 100%);
}
```

### 17 · 复古印刷 Retro Print

哑光中饱和色块 + 等宽编号与条码装饰 + 细分割线，机械制图感

- 来源 `Dribbble · Retro cyberpunk design (CBRPNK)`
- 实测 黑 `#000000`（35%）· 灰绿 `#7D8F7C`（20%）· 橘 `#DFA15E`（19%）· 砖红 `#A44C44`（10%）
- 推导 圆角、字号、主色（作按钮用）—— 按第三节推导；**色块取实测，我原先写的红/绿偏饱和，已修正**
- 版式 左侧哑光红大卡（等宽编号 + 大标题 + 条码）→ 右侧橘 / 绿 / 灰三张色卡
- 字体 等宽编号 + 几何无衬线混排
- 圆角 R=`14`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#0D0D0D; --surface:#A44C44; --surface-2:#DFA15E; --surface-3:#7D8F7C; --surface-4:#9F978D;
  --line:rgba(13,13,13,.35); --line-hover:rgba(13,13,13,.6);
  --ink:#141414; --ink-soft:#3A322C; --muted:#6B6058; --faint:#8E8378; --ink-inv:#F0EDE8;
  --brand:#141414; --brand-hover:#2E2A26; --ring:rgba(164,76,68,.30);
  --success:#7D8F7C; --danger:#A44C44; --warning:#DFA15E;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --fs-1:10px; --fs-2:11.5px; --fs-3:13px; --fs-4:14px; --fs-5:18px; --fs-6:26px; --fs-7:40px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:700;
  --lh-body:1.55; --lh-title:1.06; --ls-label:.14em;

  --r-xs:7px; --r-sm:10px; --r-md:14px; --r-lg:20px; --r-xl:25px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

### 18 · 奢华暗调 Luxury

深褐暗底 + 象牙白 + 细衬线大标题 + 发丝线，方角

- 来源 `Dribbble · LORÉN Luxury Perfume & Body Care E-Commerce`
- 实测 深褐 `#301C13`（36%）· 象牙 `#F1ECE9`（15%）/ `#E9E2D5` · 中褐 `#4D3123` · 浅褐 `#D7CBB9`
- 推导 圆角、字号、阴影 —— 按第三节推导；**参考图无金色**，我原先写的 `#C9A227` 无依据，已改为按实测中褐取强调色
- 版式 深褐满幅 Hero（细衬线大标题 + 发丝线按钮）→ 象牙白正文分栏 + 三栏小图
- 字体 细衬线大标题（`Songti SC` 系）+ 大字距小标签（`.18em`）
- 圆角 R=`2`（形态锚点判断，非实测），按第三节展开

```css
:root{
  --bg:#301C13; --surface:#3D2618; --surface-2:#4D3123; --ivory:#F1ECE9; --ivory-2:#E9E2D5;
  --line:rgba(241,236,233,.16); --line-hover:rgba(215,203,185,.55);
  --ink:#F1ECE9; --ink-soft:#D7CBB9; --muted:#9E826A; --faint:#775641;
  --brand:#D7CBB9; --brand-hover:#E9E2D5; --brand-ink:#301C13; --ring:rgba(215,203,185,.24);
  --success:#7A8C5A; --danger:#A44C44; --warning:#B08A3A;

  --font:-apple-system,"SF Pro Text","PingFang SC","Microsoft YaHei",sans-serif; --font-display:"Songti SC",Georgia,"Times New Roman",serif;
  --fs-1:10px; --fs-2:11.5px; --fs-3:13px; --fs-4:15px; --fs-5:22px; --fs-6:36px; --fs-7:56px;
  --fw-regular:400; --fw-medium:500; --fw-semibold:600;
  --lh-body:1.75; --lh-title:1.1; --ls-label:.18em; --ls-title:-0.01em;

  --r-xs:1px; --r-sm:1px; --r-md:2px; --r-lg:3px; --r-xl:4px; --r-full:999px;

  --shadow-card:none; --shadow-brand:none;
}
```

---

## 二·补 · 质感组（第五组）

与颜色 / 字体 / 圆角 / 阴影同源。质感是颜色与圆角的结果，不随风格独立挑选；跨款搭配时按三·补的绑定关系处理。

> **渐变按钮不是通用解。仅 Dark Tech 一款允许渐变按钮，其余 17 款明确禁止。**

| 风格 | 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- | --- |
| Minimal | 纯实心墨色。**无渐变、无发光**。hover 变深一档，active 位移 `1px` | 极弱阴影 + `1px` 微边框，几乎不立起 | 线性 `1.5px`，`currentColor`，无背景 | 圆角 `8`，不加滤镜 |
| Dark Tech | 渐变 `135°` 主色→主色2 + **同色发光** `0 10px 26px rgba(109,92,255,.38)` | 玻璃 `blur(24px)` + `1px` 半透明描边 + inset 顶部高光 | 线性 `1.75px`，`#C9C9D1` | 圆角 `12`，叠暗色遮罩压亮度 |
| Warm | pill 实心主色 + **暖色柔和发光** `0 8px 20px rgba(232,103,74,.30)`。**不用渐变** | 大圆角 `24` + 双层暖阴影，**无描边** | 线性 `1.75px`，圆端点 | 圆角 `20`，轻微暖调 |
| Editorial | 方角 `2px` 纯黑实心，**零渐变零阴影**。hover 靠**字距变化** | **不用阴影**，靠 `1px` 线条与纸色分区 | 线性 `1.5px`，细，出现频率低 | 圆角 `2` 或全出血，可黑白 |
| Soft | 双向立体：外阴影凸起，按下转 `inset`。**禁止发光** | 同色底 + 双层反向阴影，**禁止边框** | 线性 `1.75px`，与主色同色系 | 圆角 `16`，叠内阴影 |
| Bold | 纯黑实心 + `3px` 描边 + **硬阴影零模糊**，hover 位移。**禁止渐变** | 白面 + `3px` 黑描边 + `10px` 硬阴影 | 线性 `2.5px`，`#111`，圆端点 | 圆角 `16`，可加 `3px` 黑描边 |
| Neutral | 近黑实心 pill，**无渐变无发光**。hover 变深一档 | 白面 + 极弱双层阴影，**无描边**，圆角 `22` | 线性 `1.75px`，`#B8B8C0`，选中态转 `#16161A` | 圆角 `16`，图上标题叠暗色遮罩 |
| Eco | 浅绿 pill，深墨字。**无渐变无发光**，hover 加深一档 | `1px` 描边 + 方角，**无阴影** | 线性 `1.5px`，`#34382E` | 满幅摄影，方角，可叠深色遮罩压标题区 |
| Organic | 深墨或米色 pill，**无渐变无发光** | 白面 + `1px` 细线，圆角 `16`，**无阴影** | 线性 `1.5px`，`#4E4235`，外裹圆形细线徽章 | 圆角 `16`，暖调压暗 |
| Graph | 紫色实心 + 同色发光，**不用渐变** | 玻璃 `blur(20px)` + `1px` 半透明描边 + inset 顶部高光 | 线性 `1.75px`，`#9FB3AE`，激活转紫 | 圆角 `12`，叠深色遮罩压亮度 |
| Mesh | 纯色实心，**禁止渐变**——渐变只给背景大面 | 白面或全透明，**无边框无阴影** | 线性 `1.75px`，`#5A5A62` | 圆角 `20`，不加滤镜 |
| Chroma | 双向立体：外阴影凸起，按下转 `inset`。**禁止发光** | 同色底 + 双向反向阴影，**禁止边框** | 线性 `1.75px`，与主色同色系 | 圆角 `16`，叠内阴影 |
| Gigatype | 橙红实心 pill，**无渐变**，hover 加深一档 | 浅灰面 + 极弱阴影，圆角 `14` | 线性 `1.75px`，`#4A4A52` | 产品图无边框，叠在背景字之上 |
| Brutalist | 近黑实心方块，零圆角零阴影，hover 反色 | 单色块 + `2px` 黑描边，**零圆角零阴影** | 线性 `2.5px`，`#0A0A0A` | 方角，可叠 `2px` 黑描边 |
| Noise | 玫粉实心 + 同色发光，方角 | 近黑面 + `1px` 白线，**方角**，可叠噪点 | 线性 `1.5px`，`#A8A8A8`，等宽字标签 | 方角，叠噪点与粉色调 |
| Chrome | 蓝灰实心 + 冷光晕，**不用渐变** | 铬合金渐变面 + inset 顶部高光，圆角 `20` | 线性 `1.75px`，`#A5AEC2` | 圆角 `18`，叠冷色高光 |
| Retro Print | 近黑实心 pill，**无渐变无阴影** | 哑光色块 + `1px` 深描边，**无阴影** | 线性 `1.5px`，`#141414`，配等宽编号 | 圆角 `16`，可叠单色遮罩 |
| Luxury | 象牙白实心或细描边，**无渐变无发光** | 深褐面 + `1px` 发丝线，**方角零阴影** | 线性 `1.25px`，细，`#D7CBB9` | 方角，暖调压暗，可全出血 |

与 `prompt.md` 第 3.5 节冲突时，**3.5 的通用规则优先**；风格质感只决定**形态**（渐变还是实心），不决定**有无**。

---

## 三 · 自定义风格

**触发**：风格无法映射到菜单 / 用户说"参考某站""要更 XX 一点" / 只给了品牌色。

**铁律**：推导完**必须交用户确认**，不得跳过直接开工。

### 流程

**1 · 提三锚点**（抽不出就追问）

| 锚点 | 取值 |
| --- | --- |
| 明暗基调 | 亮 / 暗 / 中间调 |
| 色彩性格 | 单色克制 / 冷色科技 / 暖色亲和 / 高饱和撞色 / 低对比奶油 |
| 形态性格 | 方角硬朗 / 中性 / 圆润 / 极柔拟物 |

**2 · 找基底**：用锚点去第二节找最近的一款。多数需求是变体，不是新风格。

**3 · 判变体还是新风格**

| 情况 | 处理 |
| --- | --- |
| 只改颜色 | **变体**：沿用基底字体 / 圆角 / 阴影，只换颜色组 |
| 形态锚点也变 | **新风格**：五组全部重推 |

**4 · 按序推导**：`颜色 → 圆角 → 阴影 → 字体 → 质感`

顺序有依赖：阴影必须匹配圆角；质感组收口（看颜色 + 圆角 + 阴影才能定）。

### 推导规则

**颜色**

- 底：亮调 `#F8F9FA`~`#FDFCFA`；暗调 `#0A0A0B`~`#16161A`
- 主色：HSL 饱和度 `55–75%`、明度 `50–60%`。禁用原色（Bold 除外）
- 文字：不用纯黑，从底色色相同向偏（暖底 `#3A2A22`，冷底 `#111827`）
- 语义色：降饱和到与主色同明度档

**圆角**

- 基数 R：方角 `2` / 中性 `8` / 圆润 `14` / 极柔 `20`
- 展开：`xs=R×0.5 / sm=R×0.7 / md=R / lg=R×1.4 / xl=R×1.8 / full=999px`
- 按钮与输入框圆角差 ≤ `2px`

**阴影**（由圆角定）

| 圆角 | 阴影 |
| --- | --- |
| `R≤4` | 硬阴影零模糊 `4px 4px 0 <深色>` |
| `R 8–14` | 双层柔和 `0 1px 2px …, 0 4px 12px …` |
| `R≥18` | 大范围低透明 `0 2px 4px …, 0 16px 40px …` |

暗底改用 `1px` 边框 + 极弱外发光。

**字体**

- 中文只用 PingFang SC 系。气质靠三条：人文 → 标题换衬线 `"Songti SC", Georgia, serif`；科技 → 英文 Inter + 数字等宽；亲和 → 加大字重
- 阶梯：从全集取 6–7 级。密度高取偏小一组，密度低取跨度大一组
- 字重：克制 `400/500/600`；亲和 / 大胆 `500/600/700` 或 `600/700/800`

### 反例

- ❌ "高级感"→丢一堆灰（高级感来自留白与层级，不是灰度）
- ❌ 只换颜色组就称新风格（那是**变体**，记作「基底 + 换组」，见三·补）
- ❌ 五组各自独立挑（圆角与阴影不能脱钩）
- ❌ 主色用原色

### 确认模板

```text
风格：<自命名>
基底：<最接近的菜单风格> + <改了哪几项>
颜色组：底 / 面 / 线 / 主文 / 次文 / 主色 / 强调 / 语义
字体组：族 / 阶梯 / 字重 / 行高 / 字距
圆角组：xs / sm / md / lg / xl / full
阴影组：<形态>
质感组：按钮 / 卡片 / 图标 / 图片
识别特征：<一句话，什么不能省>
```

确认后按第二节格式固化写回。**缺组视为未定义，不得交付。**

---

## 三·补 · 组合用法

**风格不是单选锁定项。** 第二节每一款都是可复用的规范组，任何场景都可整组取用，也可从多款各取所需。

### 三种用法

| 用法 | 做法 | 适用 |
| --- | --- | --- |
| **整组套用** | 选一款，颜色 / 字体 / 圆角 / 阴影 / 质感全取 | 默认，最稳 |
| **基底 + 换组** | 选一款为基底，只替换其中若干组 | 常用：换颜色不改形态 |
| **跨款拼装** | 从多款各取所需，自由搭配 | 有明确意图时 |

### 绑定关系（不可拆）

```text
圆角 ↔ 阴影       必须同源或同档：方角配硬阴影，大圆角配柔阴影
质感 ← 颜色 + 圆角  质感是这两者的结果，不能独立挑
字体 ↔ 场景       可自由换，与形态无绑定
```

### 一致性检查（拼装后必过）

1. 圆角与阴影同档？方角必须配硬阴影，大圆角必须配柔阴影
2. 质感形态与圆角冲突？如 Bold 的硬阴影不得配 Soft 的圆角
3. 主色面积 ≤ `10%`、正文对比度 ≥ `4.5:1` 是否仍成立
4. 是否出现纯黑纯白？是否混用两套图标？

任一不过 → 退回整组套用。

---

## 四 · 使用规则

1. 先确认风格，再取 token。风格未确认前不动 token
2. 顺序：通用基础组 → 该风格五组 → 写入 `:root` → 全程只引用变量，不得再出现字面色值
3. **默认整组取用**；换组或跨款拼装必须过三·补的一致性检查
4. 圆角与阴影必须同源；质感由颜色与圆角决定，不得单独挑选
5. 风格特征优先于通用审美，冲突时以风格为准
6. 新增风格：菜单内按第二节补齐；菜单外走第三节并交用户确认
