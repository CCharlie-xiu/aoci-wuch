# 至关重要

跨项目持续收录、验证、晋升能力的个人能力仓库。

本地用于编辑；跨项目复用以 GitHub `main` 为准。远程不可用时可读本地副本，并注明可能过期。

## 使用

复用时先读远程索引，命中后再读对应能力。需要编辑分类时读 [`_meta/taxonomy.md`](_meta/taxonomy.md)。

复用流程：

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

写入、更新、晋升、退役规则见 `follow/` 对应文件。

## 校验

```bash
python3 scripts/validate.py
```

检查索引、目录、标签和成熟度。

## 使用标记

只要本次任务读取、引用或使用了本仓库内容，回答最后一行必须添加：

`【能力库已使用｜本次能力：<能力名称>】`

仅读取规则或索引：

`【能力库已使用｜本次能力：规则/索引】`

未读取本仓库：

不添加标记。
