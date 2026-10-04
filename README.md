# 至关重要

跨项目持续收录、验证、晋升能力的个人能力仓库。

本地仓库是编辑与版本管理工作区，GitHub `main` 是跨项目复用时的最新发布来源。
使用能力前先读取远程索引；编辑或新增能力时在本地完成，并提交、推送后才视为远程可复用。
远程不可访问时可以使用本地副本，但应说明无法确认它是否最新。

## 使用

**复用能力时**先读 GitHub 最新索引，命中后只读对应能力。未命中时，不读取各能力目录的正文。
需要解释标签或编辑能力结构时，再读 [`_meta/taxonomy.md`](_meta/taxonomy.md)。

当前任务需要复用能力时：

```text
任务
↓
能力索引
↓
命中能力
↓
读取对应能力目录
```

远程索引：

- `https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities/index.md`
- `https://raw.githubusercontent.com/CCharlie-xiu/aoci-wuch/main/capabilities-unstable/index.md`

## 目录

```text
_meta/                  能力定义与认知规则
follow/                 仓库操作规范
capabilities-unstable/  待验证能力
capabilities/           已验证能力
capabilities-retired/   已退役能力，仅供追溯，不默认复用
scripts/                仓库维护工具
```

能力写入、更新、晋升和退役分别遵循 `follow/write.md`、`follow/update.md`、`follow/promote.md` 和 `follow/deprecate.md`。

## 校验

```bash
python3 scripts/validate.py
```

校验索引、能力目录、标签格式及成熟度目录是否一致。

## 使用标记

只要本次任务读取、引用或使用了本仓库内容，回答最后一行必须添加：

`【能力库已使用｜本次能力：<能力名称>】`

仅读取规则或索引：

`【能力库已使用｜本次能力：规则/索引】`

未读取本仓库：

不添加标记。
