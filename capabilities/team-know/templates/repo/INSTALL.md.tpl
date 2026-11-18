# __SKILL_NAME__ · 多宿主安装与唤起

技能名固定：`__SKILL_NAME__`。知识库仓与技能入口分离：入口装到各产品的 `skills/`，正文仍只写本仓库。

本技能按**通用 AI 运行结构**设计，不绑 Cursor。有 Shell 的 Agent 均可执行下方脚本。

## 一键安装（推荐）

```bash
cd "<本知识库绝对路径>"
bash scripts/install-skill.sh
bash scripts/doctor-skill.sh
```

默认 `copy` 模式会：

1. 在各宿主 `~/.<product>/skills/__SKILL_NAME__/` 写入渲染后的 `SKILL.md`（本地路径已替换）
2. 软链 `RULES.md` / `INSTALL.md` / `AGENTS.md` / `harness/` 回本仓库
3. 某宿主目录不存在或不可写时**跳过并说明**，不导致整装失败

### 常用参数

```bash
bash scripts/install-skill.sh --targets claude,workbuddy,agents
bash scripts/install-skill.sh --mode link
bash scripts/install-skill.sh --repo /absolute/path/to/know-repo
```

## 宿主对照

| 宿主 | 用户级目录 | 唤起 |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/__SKILL_NAME__/` | `/__SKILL_NAME__` |
| Codex | `~/.codex/skills/__SKILL_NAME__/` | 引用 / 自然语言 |
| Agent Skills / DSH | `~/.agents/skills/__SKILL_NAME__/` | 自然语言 |
| WorkBuddy | `~/.workbuddy/skills/__SKILL_NAME__/` | `/__SKILL_NAME__` 或自然语言 |
| WorkBuddy AI | `~/.workbuddy-ai/skills/__SKILL_NAME__/` | 同上 |
| Cursor（可选） | `~/.cursor/skills/__SKILL_NAME__/` | 附加技能 / 自然语言 |

## 无 Skill 目录时

把 [`harness/AGENTS.snippet.md`](harness/AGENTS.snippet.md) 并入该 Agent 的 AGENTS/规则持久配置，并写明知识库绝对路径。

## 仅临时对话

本轮显式声明已加载 `RULES.md`，提醒用户稍后执行 `install-skill.sh` 或粘贴 harness 片段。

## 验证话术

```text
/__SKILL_NAME__ 把下面内容整理进知识库：……
```

期望：先处理 `sketch/` → 再写入三维（不写进当前工程）。
