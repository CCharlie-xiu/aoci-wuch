# ui-design-prompt

`ui-design-prompt[KD9DH]`

F: 让 AI 先确认风格、再直出可运行的界面设计
R:
A: `baseline.md`（总纲）；`style-color/`（颜色规范 + `palettes.html` 56 组色阶）；`style-motion/` `style-looklike/`（动效 / 组件形态）；`prompt.md`（流程）；`tokens.md`（通用基础组 + 索引）；`styles/`（18 款）
S: 风格未确认前不得开始设计；风格是可复用规范组，可跨款组合，但圆角与阴影必须同档；交付物是可运行 HTML/CSS 而非设计稿；图标必须内联 SVG

---

## 这是什么

UI 设计判断力 → 提示词 + 18 款可复用风格组 + 13 组实测色卡。

## 什么时候用

从零生成界面（落地页 / Web 应用 / 移动端 / B 端后台）· 把已有界面改得更专业 · 统一视觉风格与设计系统。

**不适用**：只改逻辑或接口、不涉及视觉的开发。

## 去哪里用

常驻注入 `baseline` → `style-color` → `style-motion` → `style-looklike` → `prompt` → `tokens`，再给设计需求。

命中后按需读，**不要全量注入**：

- 选风格 → `styles/<name>.md`
- 选配色 → **不读文件**。用户看 `style-color/palettes.html` 选定后告知编号或色值

**`style-color/palettes.html` 是给人看的展示页，AI 默认不读** —— 仅在**新增色阶**时才打开作格式参考。

## 最不能违反什么

- **总纲优先** `baseline.md` > `style-*` > `styles/*` > `tokens.md`
- **风格未确认不动手** 先问基调 / 场景 / 主色 / 明暗
- **风格可组合，非单选** 18 款任一款可搭配；整组套用 / 基底换组 / 跨款拼装
- **绑定不可拆** 圆角与阴影同档；质感由颜色 + 圆角决定
- **token 不得临场编** 取自 `tokens.md`，拼装后过一致性检查
- **交付物是代码** 单文件可运行 HTML/CSS
- **改稿语义** "再好看一点" = 加留白层级，不换风格；"换风格" = 只换视觉层；"换配色" = 只换那一组
