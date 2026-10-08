---
name: aoci-wuch
description: 个人能力库「至关重要」的入口。当前任务可能复用已有能力时使用：先读 GitHub 最新索引，命中后再按需读取对应能力文件；用户要求更新本能力库源仓库时，执行安全的 GitHub main 快进更新流程。
description_zh: 个人能力库「至关重要」——按需读取远程能力索引，复用已沉淀的能力
description_en: Personal capability library - read the remote index on demand
---

# 至关重要 · 个人能力库

本地仓库用于编辑；跨项目复用以 GitHub `main` 为准。

## 地址

```text
https://github.com/CCharlie-xiu/aoci-wuch
```

## 什么时候用

**不要默认读取能力库。**

只有当前任务可能复用已有能力时，才去读：

```text
任务
↓
1. 读能力索引     capabilities/index.md
                  capabilities-unstable/index.md
↓
2. 找命中的能力   索引一行 = 一个能力
↓
3. 只读该能力     capabilities/<name>/index.md
↓
4. 必要时继续深入 该目录内的其他文件
```

未命中就按常规方式完成当前任务，**不要继续读能力正文**。

## 复用前读取远程最新

复用前读取远程索引：

```bash
curl -fsSL "https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities/index.md"
curl -fsSL "https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities-unstable/index.md"
```

命中后按需读取对应能力文件。常规复用只用正式能力；待验证能力仅在任务适合试用时读取。退役能力只用于追溯或迁移。

本机存在能力库源仓库且其中有 `capabilities-pro/` 时（作者本机），另读私有孵化索引 `capabilities-pro/capabilities-unstable/index.md`；孵化能力仅在任务适合试用时读取，**不得把其内容写入公开仓库或公开输出**。

远程不可用时回退本地，并说明副本可能过期。远程请求失败不代表索引为空。

## 更新源仓库

本节只负责 **Skill Source Self-Update**：从 GitHub `main` 更新当前能力库源仓库。它不扫描、安装或更新 Cursor、Claude Code、Codex、豆包或其他产品中的副本。

请求路由：

- “更新这个能力库 / skill 源仓库” → 执行本节的源仓库更新流程。
- “更新 Cursor / Claude Code / Codex / 豆包里的副本” → 这属于产品目标同步；当前版本不执行，说明需要对应平台适配器。
- “所有地方都更新” → 先完成源仓库更新；产品副本同步暂不在本版本范围内。

执行规则见 [`follow/update-skills.md`](follow/update-skills.md)。简要流程：

1. 运行 `python3 scripts/update_skills.py check`。
2. 根据脚本状态处理：`UP_TO_DATE` 时结束；只有 `BEHIND` 才展示将要进入的提交和文件差异。
3. 更新前明确告知目标是当前源仓库，并取得用户对本次 fast-forward 的确认。
4. 用户确认后，使用检查结果中的本地与远程 commit 调用 `apply`：

   ```bash
   python3 scripts/update_skills.py apply \
     --expected-local <检查时的本地 commit> \
     --expected-remote <检查时的远程 commit> \
     --confirm
   ```

5. 若工作区不干净、分支/上游不匹配、发生分叉或远程不可用，按脚本状态停止；不得 stash、普通 merge、rebase、reset 或覆盖文件来绕过阻断。更新只允许脚本执行 `git merge --ff-only`。
6. `apply` 完成 fast-forward 后自动运行 `scripts/validate.py`。校验失败时如实报告；不得自动回滚或再尝试其他合并方式。

将“更新 skill”默认理解为更新当前源仓库，但在 apply 前必须展示目标和差异并确认。不要把更新仓库等同于更新已安装副本。

写入前检查工作区，并读取远程规则和目标文件；保留未提交修改。提交并推送后才算发布。

## 索引行格式

```text
name[tag]: 一句话核心职责
```

`tag` = `[类型+领域+价值+成熟度+优先级]`。完整定义在 `_meta/taxonomy.md`，**需要时再读**。

## 订阅能力 [PRO]

索引行形如 `name[tag][PRO]: ...` 的是订阅能力，正文**不在公开仓库**，`raw.githubusercontent.com` 读不到。

命中 `[PRO]` 能力时，按顺序：

1. 本机存在能力库源仓库且其中有 `capabilities-pro/` 时，直接读取 `capabilities-pro/<bucket>/<name>/`。
2. 否则用本机订阅码向授权服务读取（`<file>` 缺省为 `index.md`）：

   ```bash
   curl -fsS -H "X-Aoci-Code: $(cat ~/.aoci/license 2>/dev/null)" \
     "https://aoci-auth.aoci-wuch.workers.dev/cap/capabilities/<name>/<file>"
   ```

3. 返回 401/403 时，告诉用户该能力需要订阅，并给出授权页 `https://ccharlie-xiu.github.io/aoci-wuch/auth.html`，然后按常规方式完成任务。**不得根据索引行猜测或编造正文。**

订阅码只从 `~/.aoci/license` 读取，不要在回答中输出订阅码。

## 边界

- 写入 / 修改 / 晋升 / 退役能力前，先读对应的 `follow/` 规则
- 新能力一律写入私有孵化区 `capabilities-pro/capabilities-unstable/`，孵化期间不进公开索引、首页与 README（公开历史不可收回）
- 订阅能力正文只能在 `capabilities-pro/`，不得出现在公开目录或公开提交中
- 发布、晋升、退役都必须同步首页 `index.html`（GitHub Pages）与 `README.md`，以 `scripts/validate.py` 通过为准
- **不得自行发布或晋升能力**，免费 / 订阅的选择必须由人确认（见 `follow/promote.md`）

## 使用标记

只要本次任务读取、引用或使用了能力库内容，回答最后一行必须添加：

```text
【能力库已使用｜本次能力：<能力名称>】
```

仅读取规则或索引时：

```text
【能力库已使用｜本次能力：规则/索引】
```

未读取能力库：不添加。
