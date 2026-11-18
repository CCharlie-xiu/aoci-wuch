# 分类约定

本仓库正式内容三维：__DIM1_CN__ / __DIM2_CN__ / __DIM3_CN__。另有 `sketch/` 给人随手记，**不在三维结构内**。

检索与标签：`[A+B+C+D+E]` 五位标签 + FRAS + 时间 / 别名。操作分流见 [`RULES.md`](../RULES.md)。

## 三维（目录落点）

| 维 | 目录 | 写什么 |
| --- | --- | --- |
| __DIM1_CN__ | `__DIM1__/<id>/` | 按场景定义的该维内容 |
| __DIM2_CN__ | `__DIM2__/<id>/` | 按场景定义的该维内容 |
| __DIM3_CN__ | `__DIM3__/<id>/` | 按场景定义的该维内容 |

条目只落在其中一维，跨维用 `R` 与链接互引，不复制正文。

## 五位标签 `[A+B+C+D+E]`（必填）

| 位 | 维度 | 含义 |
| --- | --- | --- |
| **A** | Type | O/S/T/K/M/Z |
| **B** | Domain | A/D/I/M/F/W/P/C/R/O |
| **C** | Value | 1–9 |
| **D** | Maturity | E/D/S/M |
| **E** | Priority | L/M/H |

### A · Type

```text
O = Operation   S = Solution   T = Tool
K = Skill       M = MCP        Z = Other
```

### B · Domain

```text
A = Account   D = Development   I = Infrastructure
M = Media     F = File          W = Workflow
P = Product   C = Commerce      R = Region   O = Other
```

## FRAS（条目必填）

| 字段 | 含义 |
| --- | --- |
| **F** | 一句话核心 |
| **R** | 强关联其他条目 id；无则空 |
| **A** | 查阅入口（仓名、路径、配置名；无密钥） |
| **S** | 易误用约束 |

## 索引行

```text
id[ABCDE]: F一句 | aliases: a,b | updated:YYYY-MM-DD
```
