# 源仓库自更新：逻辑空间分析

## 范围

本案例分析 **Skill Source Self-Update**：将 GitHub `main` 快进到当前能力库源仓库 checkout。产品副本同步（Cursor、Claude Code、Codex、豆包等）不在范围内。

## 变量与状态

| 变量 | 状态 |
|---|---|
| 请求目标 | 当前源仓库；某产品中的副本；所有位置 |
| 工作区 | clean；dirty（含暂存、未暂存、未跟踪文件） |
| 当前分支 | `main`；其他分支；detached HEAD |
| Remote | 配置匹配；缺失；URL 与权威来源不匹配 |
| Upstream | `origin/main`；缺失；指向其他分支 |
| 提交关系 | up to date；behind；ahead；diverged |
| 远程访问 | 可访问；不可访问 |
| 更新授权 | 尚未确认；已确认本次检查所得的 commit 范围 |

## 约束

1. 权威来源固定为配置文件中的 GitHub 仓库 `main`。
2. 只允许从配置的 source checkout 更新，不扫描或写入产品安装目录。
3. 只有工作区 clean、当前分支为 `main`、remote URL 和 upstream 均匹配、远程可访问，且本地仅落后于远端时，才存在快进候选路径。
4. 必须把候选提交与变更摘要展示给用户；确认仅授权本次检查得到的 local/remote commit 对。
5. 执行时重新 fetch 并复查状态。commit 对变化则停止，要求重新检查和确认。
6. 只允许 `git merge --ff-only`。不 stash、不 rebase、不普通 merge、不 reset、不覆盖文件、不 push。
7. 更新后运行 `scripts/validate.py`。校验失败报告为“已更新但校验失败”，不自动回滚。

## 场景推演

| 请求 / 条件 | 路径 | 结论 |
|---|---|---|
| 当前源仓库；clean；`main`；remote/upstream 匹配；远端可访问；提交相同 | `check` → 比较 HEAD | `UP_TO_DATE`，不写工作树 |
| 当前源仓库；clean；`main`；remote/upstream 匹配；本地 behind；用户确认 commit 对未变化 | 展示提交和文件摘要 → 复查 → `merge --ff-only` → validate | `BEHIND` 是候选；成功后 `UPDATED` |
| 当前源仓库；工作区 dirty | 检查 porcelain 状态 → 停止 | `DIRTY`；不 fetch、不更新 |
| 当前源仓库；本地 ahead | 比较提交关系 → 停止 | `AHEAD`；不尝试推送或合并 |
| 当前源仓库；本地与远端 diverged | 比较提交关系 → 停止 | `DIVERGED`；需要人工处理分叉 |
| 当前源仓库；无配置 remote 或 remote URL 不匹配 | 配置预检 → 停止 | `NO_REMOTE`；来源不可确认 |
| 当前源仓库；无 upstream 或 upstream 不是 `origin/main` | upstream 预检 → 停止 | `NO_UPSTREAM` / `UPSTREAM_MISMATCH` |
| 当前源仓库；当前分支不是 `main` 或为 detached HEAD | 分支预检 → 停止 | `WRONG_BRANCH` |
| 当前源仓库；远端 fetch 失败 | fetch → 停止 | `REMOTE_UNAVAILABLE`；不使用过期远端状态更新 |
| 用户只要求更新某个产品中的副本 | 识别为目标同步请求 → 当前版本无 adapter | `EXTERNAL`；不能声称已更新 |
| 用户要求“所有地方都更新” | 先按源仓库流程；之后识别产品目标同步未实现 | 源可独立判定；产品目标为 `EXTERNAL` |
| 用户未确认，或确认后 local/remote commit 已变化 | apply 前确认与 commit 对检查 → 停止 | 不执行；重新展示当前差异并请求本次确认 |

## 终态定义

- `UP_TO_DATE`：权威来源已确认，当前分支与远端一致。
- `UPDATED`：已按确认的 commit 对完成 fast-forward，且校验通过。
- `DIRTY`、`AHEAD`、`DIVERGED`、`NO_REMOTE`、`NO_UPSTREAM`、`UPSTREAM_MISMATCH`、`WRONG_BRANCH`、`REMOTE_UNAVAILABLE`：明确停止条件，不自动修复。
- `FAILED`：执行或校验失败；若 fast-forward 已完成，报告中须明确更新已发生，且不回滚。
- `EXTERNAL`：产品副本更新取决于尚未实现的平台适配器，当前分析不推断其安装路径或行为。

## 覆盖边界

该状态机只判断 GitHub `main` 到一个源仓库 checkout 的安全快进路径。它不负责产品 skill 安装、产品目录发现、目录覆盖策略、多产品同步、冲突解决或发布 push。Git 与远端服务的实际可用性只能在执行时确认。
