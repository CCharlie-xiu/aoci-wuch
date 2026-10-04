---
name: aoci-wuch
description: 个人能力库「至关重要」的入口。当前任务可能复用已有能力时使用：先读 GitHub 最新索引，命中后再按需读取对应能力文件；本地仓库是编辑工作区和离线副本。
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

远程不可用时回退本地，并说明副本可能过期。远程请求失败不代表索引为空。

写入前检查工作区，并读取远程规则和目标文件；保留未提交修改。提交并推送后才算发布。

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
