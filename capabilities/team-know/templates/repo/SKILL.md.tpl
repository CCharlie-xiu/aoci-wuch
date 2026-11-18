---
name: __SKILL_NAME__
description: >-
  __TITLE__ 知识库：根据用户描述/材料分析后整理写入本知识库
  （__DIM1_CN__/__DIM2_CN__/__DIM3_CN__）。用于笔记入库、功能总结、sketch 归档。
  用户提到 __SKILL_NAME__、整理进知识库、/__SKILL_NAME__ 时使用。
description_zh: 跨项目知识入库——读用户描述，分析后写入规范文档
description_en: Cross-project skill that ingests notes into the knowledge repo.
---

# __SKILL_NAME__ · __TITLE__

跨宿主个人技能。**知识正文只写入知识库仓库**，不要写进当前业务工程。

## 知识库地址（安装脚本会写入绝对路径）

```text
本地: __KNOW_REPO__
```

若「本地」不是本机知识库绝对路径：在知识库根目录执行 `bash scripts/install-skill.sh` 重新渲染。

规则唯一源：知识库内 `RULES.md`。每次使用先读它。

## 各宿主怎么唤起

| 宿主 | 安装目录（用户级） | 快捷唤起 |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/__SKILL_NAME__/` | `/__SKILL_NAME__` |
| Codex | `~/.codex/skills/__SKILL_NAME__/` | 引用 skill / 说 __SKILL_NAME__ |
| Agent Skills 共用 | `~/.agents/skills/__SKILL_NAME__/` | 自然语言 |
| WorkBuddy | `~/.workbuddy/skills/__SKILL_NAME__/` | `/__SKILL_NAME__` 或自然语言 |
| WorkBuddy AI | `~/.workbuddy-ai/skills/__SKILL_NAME__/` | 同上 |
| Cursor（可选） | `~/.cursor/skills/__SKILL_NAME__/` | 附加技能 / 自然语言 |
| 无 Skill 宿主 | 粘贴 `harness/AGENTS.snippet.md` | 读 RULES |

```bash
cd "<知识库绝对路径>"
bash scripts/install-skill.sh
bash scripts/doctor-skill.sh
```

## 第一步（强制）：接入规则

1. 读知识库 `RULES.md`
2. 确认一句：`已接入 __TITLE__ 规则`

## 跨项目入库（主路径）

```text
1. 只在知识库路径读写；禁止把三维建到当前业务工程
2. 检查 sketch/：有待处理 → 摘要 → 问用户类型 → 确认后写入三维并记来源 → 原件进 _archived/
3. 分析后按 _template/ 写入：五位标签、FRAS、created/updated、aliases；登记索引
4. 回报 id 与 tag；用户要求再 commit/push
```

## 边界

- 知识正文只进知识库仓
- 不写密钥；不把半成品当正式条目
- 规则唯一源 = `RULES.md`；不依赖特定 IDE
