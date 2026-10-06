# style-motion

**动效规范。** 决定「什么时候动、动多快、怎么缓动」。

```text
一 · 时长阶梯     五档，取自 Carbon 三段六档
二 · 缓动曲线     基础四条 + 方向两层
三 · 入场 / 出场
四 · 交互反馈
五 · 无障碍
六 · 与风格的关系   曲线与时长恒定，只有幅度随风格变
七 · 需要写实现时   按需加载 GSAP 官方技能
```

受 `baseline.md` 总纲约束。

## 依据来源

数值取自三个设计系统发布的 **token 源文件**（直取单文件，不读文档站）：

| 源 | 路径 | 体积 |
| --- | --- | --- |
| IBM Carbon | `unpkg.com/@carbon/motion/src/dtcg/motion.json` | 2.8 KB |
| Shopify Polaris | `polaris-tokens/src/themes/base/motion.ts` | 3.1 KB |
| Material MDC | `mdc-animation/_animation.scss` | 1.3 KB |
| easings.net | `src/easings/easingsFunctions.ts` | 3.5 KB |

---

## 一 · 时长阶梯

五档。与 Carbon 的 `fast / moderate / slow` 三段六档、Polaris 的 `50–500` 刻度、MDC 常用区间对齐。

| 档 | 时长 | 变量 | 用在哪 |
| --- | --- | --- | --- |
| **微** | `70–110ms` | `--dur-fast` | 按钮、开关、勾选 —— 即时响应 |
| **短** | `150ms` | `--dur` | 默认过渡、淡入、小位移 |
| **中** | `240ms` | `--dur-mid` | 展开、toast、卡片升降 |
| **长** | `400ms` | `--dur-slow` | 大展开、重要通知 |
| **极长** | `700ms` | `--dur-xslow` | 背景遮罩、大 Hero 过渡 |

- 超过 `700ms` 视为卡顿
- 距离越长时长越长，但**不超过上一档**
- 同屏同时运动的元素 ≤ 3 组
- **出场比入场快一档**（入场 `240` → 出场 `150`）
- 无限循环（spinner / 骨架屏微光）不受上表约束，用固定周期 `1.4s`

---

## 二 · 缓动曲线

### 基础四条（取自 Material MDC）

| 用途 | 曲线 | 变量 |
| --- | --- | --- |
| **标准**（进出通用） | `cubic-bezier(.4,0,.2,1)` | `--ease` |
| **入场**（减速） | `cubic-bezier(0,0,.2,1)` | `--ease-out` |
| **出场**（加速） | `cubic-bezier(.4,0,1,1)` | `--ease-in` |
| **临时出场**（回位） | `cubic-bezier(.4,0,.6,1)` | `--ease-sharp` |

### 方向分层（取自 Carbon 的产物型 / 表现型）

| 方向 | 产物型 Productive | 表现型 Expressive |
| --- | --- | --- |
| 标准 | `cubic-bezier(.2,0,.38,.9)` | `cubic-bezier(.4,.14,.3,1)` |
| 入场 | `cubic-bezier(0,0,.38,.9)` | `cubic-bezier(0,0,.3,1)` |
| 出场 | `cubic-bezier(.2,0,1,.9)` | `cubic-bezier(.4,.14,1,1)` |

- **产物型**：B 端后台、工具、数据密集 —— 克制、快、不抢注意力
- **表现型**：品牌页、营销、内容型 —— 稍慢、带回弹感
- **同一产品只用一档，不混**

### 规则

- **禁止 `linear`**，除非循环进度条或无限旋转
- 曲线与时长必须配对：入场配减速曲线，出场配加速曲线
- 弹性曲线 `cubic-bezier(.34,1.56,.64,1)` 一屏最多用一次
- 需要自定义曲线时，先在 `cubic-bezier.com` 调好再写死，不要临场估

---

## 三 · 入场 / 出场

| 元素 | 入场 | 出场 |
| --- | --- | --- |
| 页面 / 路由 | 淡入 + 上移 `8px`，`240ms` | 淡出，`150ms` |
| 弹层 / 抽屉 | 淡入 + 位移 `16px`，`240ms` | 淡出 + 位移，`150ms` |
| 列表项 | 依次淡入 + 上移 `6px`，错开 `40ms` | 整体淡出，不逐个 |
| 卡片 hover | 上移 `2–4px` + 阴影加深，`110ms` | 回位，`110ms` |
| 数值变化 | 数字滚动，`400ms` | — |
| 图表 | 从基线生长，`400ms` | — |

- **入场必须带位移**，纯淡入显得廉价（Polaris 的 `appear-above` / `appear-below` 就是这个模式：`translateY(space-100)` + `opacity 0→1`）
- 列表错开 ≤ 6 项，超过则整体入场
- 页面切换不做左右滑动（除非是移动端多级导航）
- 同屏入场顺序：底 → 面 → 内容，自上而下

---

## 四 · 交互反馈

| 动作 | 反馈 |
| --- | --- |
| hover | `110ms`：颜色加深 / 上移 / 阴影加深，**三者取一** |
| 按下 | `70ms`：位移 `1px` 或缩放 `0.98` |
| 聚焦 | `150ms`：主色描边 + 微光环 `0 0 0 3px var(--ring)` |
| 加载 | 骨架屏优于转圈；超过 `1s` 才出现指示器 |
| 成功 | 勾选动画 `400ms`，不弹 toast |
| 失败 | 水平抖动 `±4px`，`240ms`，配危险色描边 |

- 每个可交互元素**必须有 hover 与 focus 态**
- **按下反馈必须快于 hover 反馈**（`70` < `110`）
- 不用弹跳表示「成功」（除非是游戏化产品）
- 提交类按钮：点击后立即进入 loading，不等接口返回

---

## 五 · 无障碍

- **必须尊重 `prefers-reduced-motion: reduce`**：关闭位移与缩放，只保留淡入淡出
- 动效不得承载唯一信息 —— 颜色与位移都要有文字或图形兜底
- 闪烁频率 < `3Hz`

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
    scroll-behavior:auto !important;
  }
}
```

---

## 六 · 与风格的关系

曲线与时长是**跨风格常量**，不随风格变。只有**幅度**随风格变：

| 风格类型 | 位移幅度 | 弹性曲线 | 举例 |
| --- | --- | --- | --- |
| **克制型** | ≤ `2px`，几乎不动 | 禁用 | Minimal · Editorial · Luxury · Neutral |
| **常规型** | `4–8px` | 禁用 | Warm · Organic · Eco · Soft · Chrome |
| **活跃型** | `8–16px` | 可用 | Bold · Brutalist · Noise · Gigatype · Chroma |
| **数据型** | 元素内部动（柱 / 环生长） | 禁用 | Graph · Mesh · Retro |

风格文件若声明了动效幅度，以风格文件为准；未声明则按上表。

---

## 七 · 需要写实现时

**本文件只给规格，不给实现代码。** 需要 JS 动画实现时，按需加载 GSAP 官方技能库 —— **默认不读**：

```text
https://github.com/greensock/gsap-skills
入口 skills/llms.txt（3.1 KB，列出 8 个技能与触发词）
```

| 技能 | 何时读 | 体积 |
| --- | --- | --- |
| `gsap-core` | 基础补间、easing、stagger、matchMedia | 14.8 KB |
| `gsap-timeline` | 多步编排、keyframes、position 参数 | 4.4 KB |
| `gsap-scrolltrigger` | 滚动驱动、pin、parallax、scrub | 18.4 KB |
| `gsap-plugins` | Flip / Draggable / SplitText / CustomEase | 21.6 KB |
| `gsap-react` | React / Next.js、useGSAP、cleanup | 6.6 KB |
| `gsap-frameworks` | Vue / Svelte / Nuxt 生命周期 | 10.6 KB |
| `gsap-utils` | clamp / mapRange / snap / toArray | 12.1 KB |
| `gsap-performance` | 60fps、jank、will-change、批处理 | 4.1 KB |

**先读 `llms.txt` 判断该加载哪个，再读对应 `SKILL.md`** —— 不要全量读 8 个（合计 ≈ 90 KB）。

GSAP 自 Webflow 收购后全部插件免费（含 SplitText / MorphSVG），`npm install gsap` 即可，无需 token 或私有源。
