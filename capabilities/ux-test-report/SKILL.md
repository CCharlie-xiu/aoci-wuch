---
name: ux-test-report
display_name: "体验侧测试报告"
display_name_en: "UX Test Report"
description: "把近几日产品改动收成体验侧测试报告：怎么测/怎样算过/代码期望三列；交付 Markdown + 自包含 HTML。任意能读写文件的 AI Agent 均可执行，不绑 Cursor/Claude/Codex/WorkBuddy。触发：测试报告、体验侧验收、总结改动列测试、双栏用例、给测试同学。"
description_zh: "体验侧测试报告：交互白话 + 代码期望，产出 md/html，不绑 IDE。"
description_en: "Experience-side test report: how-to-test / pass-criteria / code-expect columns; Markdown + standalone HTML; IDE-agnostic."
examples_zh:
  - "总结这两天改动，列测试内容，给测试同学能看懂的报告"
  - "用例要怎么测、怎样算过、代码期望三列都有"
  - "导出可转发的 HTML，别绑某个编辑器"
examples_en:
  - "Summarize last two days of changes into a QA-facing test report"
  - "Each case needs how-to-test, pass criteria, and code expectations"
  - "Ship a standalone HTML we can forward; no IDE lock-in"
version: 0.1.0
author: "wuch-ai"
---

# 体验侧测试报告

把「改了啥 / 怎么验」收成 **测试能点、开发能对字段** 的报告。  
**不绑定任何 IDE 或产品 UI。**

## 作者

- 开发：wuch-ai
- 能力库：至关重要（aoci-wuch）· 孵化名 `ux-test-report`

## Agent 总规则

1. 先读同目录 `index.md` 与 `references/playbook.md`
2. 主交付必须是项目内（或用户指定路径）的：
   - `<slug>-test-report.md`
   - `<slug>-test-report.html`（单文件，浏览器可开）
3. 结构契约：`references/report-shape.md`；HTML 壳：`references/html-template.html`
4. 每条用例三列：**怎么测 | 怎样算过 | 代码期望**
5. 可选增强（Canvas / 浏览器截图）仅在当前环境具备时使用；**不得**因缺专有能力而拒绝交付
6. 不写密钥、密码、订阅码

## 执行摘要

| 关卡 | 动作 |
| --- | --- |
| G0 | 收料：日期窗、分支、变更日志、git log、产品语义 |
| G1 | 双栏：用户侧变化 + 代码/接口对照 |
| G2 | 分组用例，三列齐全，写优先顺序 |
| G3 | 落盘 md + html，告知绝对路径 |
| G4 | 可选：截图 / IDE 旁路预览 |
| G5 | 可选：给测试/开发各一句转发口径 |

## 边界

- 不产 E2E 自动化脚本
- 不把运维变更日志当缺陷编号台账
- 不宣称已替用户发给测试同学

## 参考

- `index.md` — FRAS 与边界
- `references/playbook.md`
- `references/report-shape.md`
- `references/html-template.html`
- `references/example-outline.md`
