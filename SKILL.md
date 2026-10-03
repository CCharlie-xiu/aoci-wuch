---
name: aoci-wuch
description: 个人能力库「至关重要」的入口。当前任务可能复用已有能力时使用：先读远程能力索引，命中后再按需读取对应能力文件，不要一次性加载整个能力库。能力库是 GitHub 上的独立外部仓库，不在当前项目目录里。
description_zh: 个人能力库「至关重要」——按需读取远程能力索引，复用已沉淀的能力
description_en: Personal capability library - read the remote index on demand
---

# 至关重要 · 个人能力库

你有一个独立的个人能力库，托管在 GitHub 上，**不在当前项目目录里**。
不要在项目内寻找 `至关重要/`，也不要假设项目里带了副本。

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

## 每次都读远程最新

能力库会持续新增能力。**不要依赖安装时缓存的能力列表**，每次使用都重新读远程索引。

```bash
curl -s "https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities/index.md"
```

公开仓库，无需凭据。取单个能力文件同理，把路径换成 `capabilities/<name>/index.md`。

## 索引行格式

```text
name[tag]: 一句话核心职责
```

`tag` = `[类型+领域+价值+成熟度+优先级]`。完整定义在 `_meta/taxonomy.md`，**需要时再读**。

## 边界

- 写入 / 修改 / 晋升能力前，先读 `follow/write.md`、`follow/update.md`、`follow/promote.md`
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
