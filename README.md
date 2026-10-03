# 至关重要

跨项目持续收录、验证、晋升能力的个人能力仓库。

## 使用

进入本仓库后，先读取：

[`_meta/taxonomy.md`](_meta/taxonomy.md)

未命中具体需求时，不读取 `capabilities/` 或 `capabilities-unstable/` 中的能力内容。

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

索引：

- `capabilities/index.md`
- `capabilities-unstable/index.md`

## 目录

```text
_meta/                  能力定义与认知规则
follow/                 仓库操作规范
capabilities-unstable/  待验证能力
capabilities/           已验证能力
```

## 使用标记

只要本次任务读取、引用或使用了本仓库内容，回答最后一行必须添加：

`【能力库已使用｜本次能力：<能力名称>】`

仅读取规则或索引：

`【能力库已使用｜本次能力：规则/索引】`

未读取本仓库：

不添加标记。
