# wuch-design-canvas

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`wuch-design-canvas[KD8SH]`

F: 按 wuch-ai 设计锚点询问用户所需效果，确认后产出设计风格 Canvas
R:
A: 询问清单见 `ask-checklist.md`；视觉基线见 `design-baseline.md`；Canvas 产出契约见 `canvas-output.md`
S: 必须先问清效果并得到用户确认才写 Canvas；色板/字体/相位只能来自 `design-baseline.md`，禁止另起紫色渐变或奶油风；仅浅色主题

---

## 这是什么

把 **openui-lab / wuch-ai 的 DESIGN-ANCHOR v1.2** 收成可复用能力：冷白双表面、深松绿主操作、工作台回合相位、动效档位。

Agent 的交付物不是又一份 Markdown 规范，而是一份可在 Cursor 并排打开的 **`.canvas.tsx` 设计风格板**，内容必须反映用户确认过的效果范围。

源项目事实：`docs/DESIGN-ANCHOR.md`、`apps/web/css/app.css`（本能力已摘录到 `design-baseline.md`，换机器不必依赖 openui-lab 仓库）。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 展示 / 预览当前设计风格、设计锚点、视觉基线 | 命中 |
| 按 wuch-ai / openui 风格做设计板、风格 Canvas | 命中 |
| 新页面 / 新工作台 UI，要求对齐这套设计系统并出可视化板 | 命中 |
| 只要改几个 CSS token、不要画布 | 不命中；直接改项目 |
| 要深色主题整套色板 | 不命中基线（仅浅色）；说明约束后可另开能力 |

## 怎么用（强制流程）

```text
1. 读本 index.md + design-baseline.md
2. 按 ask-checklist.md 询问用户所需效果（可一次多问）
3. 汇总方案，请用户确认（改/删/加范围）
4. 用户明确确认后，才按 canvas-output.md 写入 Canvas
5. 用绝对路径链接提示用户打开；能 open_resource 则打开
```

### 1. 询问

必问项见 `ask-checklist.md`。未问清不得开始写 Canvas。

### 2. 确认

向用户输出一段确认摘要，至少包含：

- 产品名 / 一句话
- 要展示的板块（色板、字体、组件样张、工作台相位、页面骨架…）
- 是否包含工作台 7 相位
- Canvas 文件名建议

等用户说「确认 / 可以 / 按这个做」等同义确认后再写文件。

### 3. 产出 Canvas

- 路径：当前工作区 `~/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx`
- 只 `import` from `cursor/canvas`
- 色值与文案遵守 `design-baseline.md` 与 `canvas-output.md`
- 画布外壳用 `useHostTheme()`；项目色板 hex 仅作为「被展示的数据」

### 4. Cursor 技能入口

本机 Cursor 技能：`~/.cursor/skills/wuch-design-canvas/SKILL.md`（指向本目录）。触发后仍执行上述流程，不得跳过询问与确认。

## 最不能违反什么

- **先确认后产出**：用户未确认效果范围时，禁止写 `.canvas.tsx`。
- **只用本基线**：禁止换成 Inter + 紫渐变、奶油底 + 衬线 terracotta、报纸风等常见 AI 默认皮。
- **仅浅色**：不发明 dark token 集；`prefers-reduced-motion` 必须在动效说明里出现。
- **编译不是独立 badge**：工作台相位里「编译」属于 `generating` 子态。
- **不公开泄漏**：本目录在 `capabilities-pro/`，校验/提交只动私有仓库。
