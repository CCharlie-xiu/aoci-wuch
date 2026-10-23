# Canvas 产出契约

用户确认后执行。参考实现：工作区若已有 `design-anchor.canvas.tsx` 可更新；否则新建。

## 文件位置

```text
/Users/<user>/.cursor/projects/<workspace>/canvases/<name>.canvas.tsx
```

- 必须写在该目录**根下**（不要子目录）
- 单文件；只 `import` from `cursor/canvas`
- `export default` 根组件
- 无 `fetch`、无相对导入、无 npm 包

## 结构要求

按用户确认的板块组装，**未确认的板块不要塞进画布**。推荐顺序：

1. 页头：版本 `DESIGN ANCHOR · v1.2`、产品一句话、范围 Pill  
2. 双表面 + 工作台骨架示意（若选）  
3. 色板（若选）  
4. 字体样张（若选）  
5. 间距 / 圆角 / 高度 / 动效（若选）  
6. 工作台相位表（若选）  
7. 组件样张（若选）  
8. 页面骨架（若选）  
9. 冻结规则（若选）  
10. 页脚：说明「hex 是项目数据；画布外壳是宿主主题」

## 视觉规则（Canvas SDK）

- 画布壳：`useHostTheme()` 的 `bg` / `text` / `stroke` / `fill`  
- **项目色**：来自 `design-baseline.md` 的 hex，仅出现在色板样张、按钮标本、相位 badge 等「被展示」区域  
- 禁止：渐变、box-shadow、emoji 装饰、彩虹乱用  
- 布局：`Stack` / `Row` / `Grid` / `Table` / `Pill` / `H1–H3` / `Text` 混排，不要整页同款 Card 墙

## 相位展示

若用户要工作台相位，必须使用 baseline 中的 7 个 phase 名与 badge 文案；`generating` 注释含「流式编译子态」。

## 完成后

1. 用**绝对路径** markdown 链接指向 `.canvas.tsx`  
2. 一句说明：可在聊天旁打开 Canvas  
3. 若有 `open_resource`，打开该文件  
4. 回答末行（若经能力库）：`【能力库已使用｜本次能力：wuch-design-canvas】`

## 验收

- [ ] 询问 + 确认已完成  
- [ ] 板块与用户确认一致（无擅自加项）  
- [ ] 色值全部可在 `design-baseline.md` 找到  
- [ ] Canvas TypeScript check 无错误  
- [ ] 未引入深色主题 token 集  
