---
name: team-know
description: >-
  个人/协作知识库 team-know：询问场景后初始化三维+sketch+索引知识库，按业务定制 RULES，
  并引导完成一轮入库与检索体验。用于建知识库、团队知识库、笔记入库、sketch 归档。
  用户提到 team-know、建知识库、个人知识库、团队知识库、初始化知识库结构时使用。
  不绑 Cursor；Claude/Codex/WorkBuddy/通用 Agent 均可。海外库继续用 oversea-know。
description_zh: 初始化并定制个人/协作知识库，跨宿主入库与体验引导
description_en: >-
  Bootstrap and customize a personal/team knowledge repo with dimensions,
  sketch inbox, and indexed entries; host-agnostic ingest and guided tour.
---

# team-know · 个人/协作知识库

跨宿主个人技能。**知识正文只写入知识库路径**，不要写进当前业务工程。

完整能力说明见同目录 [`index.md`](index.md)。规则在用户知识库内的 `RULES.md`（初始化后生成）。

## 强制流程

1. 询问场景（个人/团队、领域、维名、绝对路径、主要 AI 宿主）
2. 运行 `scripts/init-know-repo.sh`
3. 按场景改写 `RULES.md` / `SKILL.md` / `AGENTS.md`
4. 按 `references/guided-tour.md` 带用户体验一轮
5. 可选安装：`bash <知识库>/scripts/install-skill.sh`

## 宿主唤起（安装后）

| 宿主 | 目录 | 唤起 |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/team-know/` | `/team-know` |
| Codex | `~/.codex/skills/team-know/` | 引用 / 自然语言 |
| Agent Skills | `~/.agents/skills/team-know/` | 自然语言 |
| WorkBuddy | `~/.workbuddy/skills/team-know/` | `/team-know` 或自然语言 |
| WorkBuddy AI | `~/.workbuddy-ai/skills/team-know/` | 同上 |
| Cursor（可选） | `~/.cursor/skills/team-know/` | 附加技能 / 自然语言 |
| 无 Skill 宿主 | 粘贴 `harness/AGENTS.snippet.md` | 读 RULES |

## 边界

- 已有海外知识库 → `oversea-know`，不用本技能覆盖
- 规则唯一源 = 知识库 `RULES.md`；不依赖任何 IDE
- 密钥不入库；半成品不进正式条目
