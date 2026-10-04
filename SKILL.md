---
name: aoci-wuch
description: 个人能力库「至关重要」的入口。当前任务可能复用已有能力时使用：先读 GitHub 最新索引，命中后再按需读取对应能力文件；本地仓库是编辑工作区和离线副本。
description_zh: 个人能力库「至关重要」——按需读取远程能力索引，复用已沉淀的能力
description_en: Personal capability library - read the remote index on demand
---

# 至关重要 · 个人能力库

能力库同时有本地 Git 工作区和 GitHub 远程仓库。**跨项目复用时 GitHub `main` 是最新发布来源；本地副本用于编辑、提交和离线回退。** 不要假定本地副本一定已同步。

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

能力库会持续更新。每次需要复用能力时，都从远程读取两个索引，不依赖安装时缓存或本地索引：

```bash
curl -fsSL "https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities/index.md"
curl -fsSL "https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities-unstable/index.md"
```

命中后，按需从同一远程分支读取 `capabilities/<name>/index.md` 或 `capabilities-unstable/<name>/index.md`，需要深入时再读取该能力目录的其他文件。只读取正式能力进行常规复用；待验证能力只有在任务明确适合试用时才读取。`capabilities-retired/` 仅用于用户明确要求追溯或迁移时。

如果远程不可访问，才回退到本地索引和文件，并在答复中说明无法确认本地副本是最新版本。不要把一次失败的远程请求当成空索引。

对本仓库进行写入时，先检查工作区状态，并读取远程 `main` 上相关规则和目标能力的最新版本；将改动与本地工作区合并考虑，不覆盖用户的未提交修改。新增或修改的能力在提交并推送到 GitHub 前，不算已发布给其他项目使用。

## 索引行格式

```text
name[tag]: 一句话核心职责
```

`tag` = `[类型+领域+价值+成熟度+优先级]`。完整定义在 `_meta/taxonomy.md`，**需要时再读**。

## 边界

- 写入 / 修改 / 晋升 / 退役能力前，先读对应的 `follow/` 规则
- **不得自行晋升能力**（`capabilities-unstable/` → `capabilities/` 必须由人确认）

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
