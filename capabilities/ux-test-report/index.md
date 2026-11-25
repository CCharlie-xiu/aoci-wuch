# ux-test-report

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`ux-test-report[KW8SH]`

F: 把近几日产品改动收成体验侧测试报告：怎么测 / 怎样算过 / 代码期望三列；交付 Markdown + 自包含 HTML（不绑任何 IDE）
R: aoci-wuch
A: `references/playbook.md`（执行流程）；`references/report-shape.md`（双栏+三列结构）；`references/html-template.html`（可直接填内容的单文件预览）；`references/example-outline.md`（样例大纲）
S: 不依赖 Cursor / Claude Code / Codex / WorkBuddy 任一专有 UI；主交付永远是仓库内 `.md` + `.html`；「怎么测/怎样算过」给测试，「代码期望」给开发——缺任一列算未完成；不写密钥与密码

---

## 这是什么

面向 **体验侧验收** 的测试报告产出能力：从 git / 变更日志 / 近期对话收料，产出同时服务测试与开发的双视角清单。

| 读者 | 看什么 |
| --- | --- |
| 测试 / 产品 | 用户侧变化；「怎么测」「怎样算过」 |
| 开发 / 联调 | 代码/接口对照；「代码期望」 |

**主交付（任意环境）：**

1. `*-test-report.md` — 可进 PR / 群聊 / 文档
2. `*-test-report.html` — 单文件打开即可看，可截图转发

**可选增强（有就用，没有就跳过）：** 当前 IDE 若支持旁路 Canvas / 预览面板，可再镜像一份；**不得**把专有预览当成唯一交付。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 总结这两天改动、列测试内容 | 命中 |
| 测试报告 / 体验侧验收清单 / 给测试同学 | 命中 |
| 用例太技术 / 太白话，要双栏三列 | 命中 |
| 弄成可转发页面 / 截图 | 命中（HTML + 可选截图） |
| 只改一处 bug、不要清单 | 不命中 |
| 写自动化 E2E 脚本 | 不命中（本能力产报告，不产测试代码） |

## 怎么用

1. 读 `references/playbook.md`，按关卡执行。
2. 结构以 `references/report-shape.md` 为准。
3. HTML 以 `references/html-template.html` 为壳填内容（或等价自写，列不能少）。
4. 需要口径示范读 `references/example-outline.md`。

## 最不能违反什么

- **三列齐全**：怎么测 / 怎样算过 / 代码期望。
- **双层读者**：白话不堆字段塞给测试；代码期望不省略接口码/字段。
- **不绑 IDE**：禁止「只能在某某产品里打开」才算完成。
- **不泄密**：不写密码、订阅码；代理只记角色与端口用途。
