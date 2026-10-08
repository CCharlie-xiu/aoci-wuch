# 至关重要 · AOCI-Wuch

**一个可复用的 AI Agent 能力库。** 为 AI 编码助手提供经过整理的工作方法、流程与工具接入指南：先按任务查找能力，再只读取命中的说明。

**A reusable capability library for AI agents.** It gives AI coding assistants practical workflows, methods, and tool setup guides. The assistant checks the catalog for each task, then loads only the relevant capability.

[项目主页 / Project site](https://ccharlie-xiu.github.io/aoci-wuch/) · [能力索引 / Stable index](capabilities/index.md) · [待验证索引 / Experimental index](capabilities-unstable/index.md)

## 安装 / Install

将仓库安装为当前 AI 助手可复用的 Agent Skill：

```text
https://github.com/CCharlie-xiu/aoci-wuch.git
```

也可以直接告诉 AI：

```text
请将 https://github.com/CCharlie-xiu/aoci-wuch.git 安装为当前 AI 助手可复用的 Agent Skill。
```

Install this repository as a reusable Agent Skill in your AI assistant using the repository URL above. Follow the installation flow for your assistant.

## 使用方式 / How it works

```text
用户任务 → 阅读能力索引 → 选择匹配能力 → 按需读取说明 → 执行任务
User task → Read catalog → Select a match → Load its guide → Do the task
```

本库不会要求 AI 在每次对话开始时载入全部能力正文。能力分为**正式**和**待验证**两类；待验证能力会明确标注，不会被当作已正式验证的能力。

The assistant does not need to load every capability in full at the start of a conversation. Capabilities are marked **Stable** or **Experimental**, so users can see their maturity at a glance.

## 能力目录 / Capability catalog

### 正式能力 / Stable

| 能力 | 用途 |
| --- | --- |
| [GitHub 应用授权](capabilities/github-authorize/) | 为指定 GitHub 应用完成授权流程 |
| [原生移动应用搭建](https://ccharlie-xiu.github.io/aoci-wuch/auth.html) `PRO` | 使用 mobile-template 家族创建 iOS / Android 项目（订阅能力） <!-- pro:mobile-template-app --> |
| [复杂设计逻辑枚举](capabilities/logic-space-enumeration/) | 推演复杂设计中的有效场景、路径与结果 |

### 待验证能力 / Experimental

| 能力 | 用途 |
| --- | --- |
| [界面风格设计](capabilities-unstable/ui-design-prompt/) | 先确认风格，再生成可运行的界面 |
| [视频画面抽帧](capabilities-unstable/video-frame-extract/) | 按要求从视频提取有序画面 |
| [DBX 数据库接入](capabilities-unstable/dbx-mcp-setup/) | 检查并配置 DBX MCP，验证数据库工具可用 |
| [Excel 后端配置](capabilities-unstable/excel-capability/) | 为 Excel 任务选择并接通合适的处理后端 |
| [LibTV 影像接入](capabilities-unstable/libtv-mcp-setup/) | 接入并验证 LibTV Remote MCP |
| [订阅授权方案](https://ccharlie-xiu.github.io/aoci-wuch/auth.html) `PRO` | 公开仓库部分内容改为订阅可得，含授权服务、授权页与后台（订阅能力） <!-- pro:subscription-gate --> |

## 仓库内容 / Repository contents

```text
SKILL.md                 AI skill entry point
capabilities/            正式能力 / Stable capabilities
capabilities-unstable/   待验证能力 / Experimental capabilities
capabilities-retired/    退役能力，仅供追溯 / Retired, for reference
follow/                  写入、更新、晋升与退役规则 / Library maintenance rules
scripts/                 校验与源仓库更新脚本 / Validation and update scripts
```

## 参与改进 / Contributing

欢迎反馈缺失的工作流、错误边界或可复用的能力。新增或调整能力前，请先阅读 [`follow/write.md`](follow/write.md)；晋升、更新和退役规则见 [`follow/`](follow/)。

Issues and pull requests are welcome for missing workflows, incorrect boundaries, and reusable capabilities. Read [`follow/write.md`](follow/write.md) before adding or changing a capability.

## 本地校验 / Validate locally

```bash
python3 scripts/validate.py
```

## 更新能力库源仓库 / Update the source repository

此流程只把 GitHub `main` 安全快进到当前源仓库，不更新任何 AI 产品中已安装的副本。先检查：

```bash
python3 scripts/update_skills.py check
```

只有状态为 `BEHIND` 时，才根据检查结果确认并应用更新：

```bash
python3 scripts/update_skills.py apply \
  --expected-local <检查时的本地 commit> \
  --expected-remote <检查时的远程 commit> \
  --confirm
```

The update command only fast-forwards this source checkout from GitHub `main`; it does not update copies installed in AI products.
