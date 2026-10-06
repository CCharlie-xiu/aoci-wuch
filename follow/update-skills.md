# Skill Source Self-Update

更新 GitHub `main` 到当前能力库源仓库。产品安装副本、插件缓存、Marketplace、AgentKit 和其他目标不属于本流程。

## 状态机

```text
工作区是否干净？
├─ 否 → DIRTY，停止
└─ 是
   ↓
remote / 当前分支 / upstream 是否与配置一致？
├─ 否 → NO_REMOTE / NO_UPSTREAM / WRONG_BRANCH / UPSTREAM_MISMATCH，停止
└─ 是
   ↓
fetch GitHub main
├─ 失败 → REMOTE_UNAVAILABLE，停止
└─ 成功
   ↓
比较 HEAD 与 origin/main
├─ 相同 → UP_TO_DATE，结束
├─ 仅远程领先 → BEHIND，展示差异并等待用户确认
├─ 仅本地领先 → AHEAD，停止
└─ 双方均有提交 → DIVERGED，停止
   ↓
用户确认 + 检查时的本地/远程 commit 仍匹配
   ↓
git merge --ff-only
   ↓
运行 scripts/validate.py
   ↓
UPDATED 或 FAILED
```

`DIRTY` 包含已跟踪文件改动、暂存改动和未跟踪文件。任何本地提交领先远程的情形都不自动处理：仅本地领先报告 `AHEAD`；本地与远程各自有新提交报告 `DIVERGED`。

## 允许的状态

| 状态 | 行为 |
| --- | --- |
| `UP_TO_DATE` | 不修改工作区，报告无需更新 |
| `BEHIND` | 展示待进入提交与差异；取得明确确认后才允许 fast-forward |
| `DIRTY` | 停止，不 stash、不覆盖、不清理 |
| `AHEAD` | 停止，不推送、不重置、不合并 |
| `DIVERGED` | 停止，交由用户处理分叉 |
| `NO_REMOTE` | 停止，来源无法确认 |
| `NO_UPSTREAM` | 停止，当前分支没有 upstream |
| `WRONG_BRANCH` | 停止，当前分支不是配置的源分支 |
| `UPSTREAM_MISMATCH` | 停止，upstream 不是配置的 remote/branch |
| `REMOTE_UNAVAILABLE` | 停止，无法 fetch 或远端分支不可达 |
| `FAILED` | 停止并保留 Git 与校验错误信息；不得自动回滚 |

## 操作

1. 读取 `_meta/skill-sync.json`，确认唯一来源、remote、branch 和策略。
2. `check` 检查仓库根目录、remote URL、分支、upstream、完整工作区状态；仅在这些条件满足时 fetch。
3. 用 Git 命令读取 ahead/behind 计数。脚本只编排 Git，不自行实现提交图、合并或冲突算法。
4. 若 `BEHIND`，展示 `HEAD..upstream` 的提交列表、文件变更和差异摘要；向用户说明本次目标只限源仓库。
5. 用户确认后，以检查时记录的本地和远程 commit 调用 `apply`。apply 必须重跑 preflight；若 HEAD 或远程 commit 已变化，停止并要求重新检查。
6. 只运行 `git merge --ff-only <upstream>`。不执行 pull、merge commit、rebase、stash、reset、checkout 或强制覆盖。
7. 更新成功后调用 `_meta/skill-sync.json` 指定的 `scripts/validate.py`。
8. 报告 `UP_TO_DATE`、`UPDATED` 或 `FAILED`，并给出旧/新 commit 与校验结果。校验失败不自动回滚。

## 不在本流程范围内

- 安装或更新 Cursor、Claude Code、Codex、豆包及其他产品中的 skill 副本
- 修改用户级目录、插件缓存、Marketplace 或云端 Skill 记录
- 在工作区有本地改动时自动保存、覆盖或尝试合并
- 自动推送本地提交
