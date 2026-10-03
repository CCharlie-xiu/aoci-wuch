# taxonomy.md

能力认知与分类规则。

本文件的 FRAS 结构改编自 AOCI-CODE Object FRAS v2，用于描述「能力」。

Capability 是一个可独立复用的能力资产包，不要求每个能力都必须有可运行代码。
**目录 = 能力边界**，目录里面放什么由能力本身决定。

## FRAS

一条索引 = 一个能力，固定顺序：

```text
F → R → A → S
```

| 字段 | 全称 | 含义 |
| --- | --- | --- |
| **F** | Function | 能力的核心职责，一个命题 |
| **R** | Relation | 理解或使用该能力时必须关联的其他能力 |
| **A** | API | 稳定的调用入口与对外契约 |
| **S** | System Constraint | 非显而易见、可能导致误用或改错的系统约束 |

### 规则

- **F**：只写核心职责，不写清单。
- **R**：写可唯一定位的强关系；没有强关系就留空，不为凑齐而制造。
- **A**：只写稳定契约，不罗列内部实现。
- **S**：只有"容易被忽略且会导致误用"的约束才写。配额是上限，不是写作目标。

---

## 标签

标签用于快速分类和定位，不代替 FRAS。

格式：

```text
[A+B+C+D+E]
```

| 位 | 维度 | 含义 |
| --- | --- | --- |
| **A** | Type | 能力类型 |
| **B** | Domain | 所属领域 |
| **C** | Value | 复用价值 |
| **D** | Maturity | 成熟度 |
| **E** | Priority | AI 使用优先级 |

### 取值

**A · Type**

```text
O = Operation
S = Solution
T = Tool
K = Skill
M = MCP
Z = Other
```

**B · Domain**

```text
A = Account
D = Development
I = Infrastructure
M = Media
F = File
W = Workflow
O = Other
```

**C · Value**

```text
1–9
低 → 高
```

**D · Maturity**

```text
E = Experimental
D = Draft
S = Stable
M = Mature
```

**E · Priority**

```text
L = Low
M = Medium
H = High
```

### 示例

```text
github-login[OA8MH]    =  O / A / 8 / M / H
pdf-to-md[TF8MH]       =  T / F / 8 / M / H
websocket-room[SD9MH]  =  S / D / 9 / M / H
```

```text
O / A / 8 / M / H
│   │   │   │   └─ Priority
│   │   │   └───── Maturity
│   │   └───────── Value
│   └───────────── Domain
└───────────────── Type
```

```text
github-login[OA8MH]
```

```text
F: 将当前设备配置到可正常使用 GitHub 的状态
R: github-ssh
A: browser-login, authentication-check
S: Web 登录成功不代表 Git CLI 已完成认证
```

---

## 边界

标签负责：

```text
分类 / 定位
```

FRAS 负责：

```text
理解 / 关联 / 使用 / 约束
```

标签不承载能力内容，FRAS 不重复标签信息。
