# tokens.md

`prompt.md` 第 1 节选定风格后，从本文件取值。

```text
一 · 通用基础组     间距 / 断点 / 动效 / 无障碍 —— 全风格共用
二 · 六风格 token   颜色 / 字体 / 圆角 / 阴影 —— 随风格切换
二·补 · 质感组      第五组：按钮 / 卡片 / 图标 / 图片
三 · 自定义风格     菜单外风格的推导流程
四 · 使用规则
```

落地形态一律为 CSS 变量，写进 `:root`，全程只引用变量。

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

## 二 · 六风格 token

每款只覆盖 **颜色 / 字体 / 圆角 / 阴影** 四组，质感组见下一节。

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

---

## 二·补 · 质感组（第五组）

与颜色 / 字体 / 圆角 / 阴影同源，不得跨风格借。

> **渐变按钮不是通用解。Minimal / Editorial / Soft / Bold 四款明确禁止。**

| 风格 | 按钮 | 卡片 | 图标 | 图片 |
| --- | --- | --- | --- | --- |
| Minimal | 纯实心墨色。**无渐变、无发光**。hover 变深一档，active 位移 `1px` | 极弱阴影 + `1px` 微边框，几乎不立起 | 线性 `1.5px`，`currentColor`，无背景 | 圆角 `8`，不加滤镜 |
| Dark Tech | 渐变 `135°` 主色→主色2 + **同色发光** `0 10px 26px rgba(109,92,255,.38)` | 玻璃 `blur(24px)` + `1px` 半透明描边 + inset 顶部高光 | 线性 `1.75px`，`#C9C9D1` | 圆角 `12`，叠暗色遮罩压亮度 |
| Warm | pill 实心主色 + **暖色柔和发光** `0 8px 20px rgba(232,103,74,.30)`。**不用渐变** | 大圆角 `24` + 双层暖阴影，**无描边** | 线性 `1.75px`，圆端点 | 圆角 `20`，轻微暖调 |
| Editorial | 方角 `2px` 纯黑实心，**零渐变零阴影**。hover 靠**字距变化** | **不用阴影**，靠 `1px` 线条与纸色分区 | 线性 `1.5px`，细，出现频率低 | 圆角 `2` 或全出血，可黑白 |
| Soft | 双向立体：外阴影凸起，按下转 `inset`。**禁止发光** | 同色底 + 双层反向阴影，**禁止边框** | 线性 `1.75px`，与主色同色系 | 圆角 `16`，叠内阴影 |
| Bold | 纯黑实心 + `3px` 描边 + **硬阴影零模糊**，hover 位移。**禁止渐变** | 白面 + `3px` 黑描边 + `10px` 硬阴影 | 线性 `2.5px`，`#111`，圆端点 | 圆角 `16`，可加 `3px` 黑描边 |

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
- ❌ 只换颜色组就称新风格（那是换皮）
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

## 四 · 使用规则

1. 先选风格，再取 token。风格未确认前不动 token
2. 顺序：通用基础组 → 该风格五组 → 写入 `:root` → 全程只引用变量，不得再出现字面色值
3. 五组同源，不得跨风格混用
4. 风格特征优先于通用审美，冲突时以风格为准
5. 新增风格：菜单内按第二节补齐；菜单外走第三节并交用户确认
