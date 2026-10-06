# libtv-mcp-setup

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`libtv-mcp-setup[TI8DH]`

F: 当需要 LibTV 影像创作时，为当前 AI 会话接入 LibTV Remote MCP，完成连接与账户授权并确认就绪
R:
A: `scripts/validate.py`（固定契约与状态校验）；固定契约：连接器名 `LibTV-wuch`、MCP 地址 `https://mcp.liblib.tv/mcp`；就绪 = 连接存在 + 地址正确 + 已连接 + 账户已授权
S: 不伪造连接成功状态；账户未授权前不得宣称「已可创作」；本能力只负责「接入与就绪」，不负责创作方法；不修改其他 MCP；已有有效 LibTV 连接时不重复创建；连接名固定 `LibTV-wuch`，除非用户明确要求改；本能力不自行创建连接器（创建/授权在客户端 UI 完成）

---

## 这是什么

远程 MCP 接入能力：让 AI 在「需要 LibTV 影像创作」时，知道**何时触发、怎么检查连接、怎么引导用户完成连接、连接完成后如何进入创作**。

它**不实现** LibTV，也不重新实现客户端的连接器创建逻辑——只做发现、判断、引导、校验、交付。

## 关键区分

```text
libtv-mcp-setup（本能力）        ≠   libtv-mcp（创作能力）
   「我需要 LibTV」                     创作图片 / 视频
   → 找到/创建连接器                    修改图片 / 生成影像
   → 授权                              分镜设计 / 参数优化
   → Ready                             …
```

「怎么接入」与「怎么使用」必须分开。本能力只做前者。这也是可复用的模式：以后接即梦、可灵、Runway、Midjourney 等其他远程 MCP，沿用同一套「接入能力」设计。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 使用 LibTV 创作影像 | 触发 |
| 用 LibTV 生成图片 / 视频 | 触发 |
| 让我连接 LibTV / 帮我接入 LibTV MCP | 触发 |
| 开始使用 LibTV 创作 | 触发 |

已有可用且已授权的 `LibTV-wuch` 时**不重复创建**，直接进入创作。

## 核心流程

```text
用户需要 LibTV
      │
      ▼
检查当前是否已有 LibTV-wuch ── 有且已授权 ──▶ 直接进入创作
      │
     无 / 未授权
      ▼
创建 LibTV-wuch（名称 + 地址 https://mcp.liblib.tv/mcp）
      ▼
保存
      ▼
引导用户完成 LibTV 账户授权
      ▼
重新检查连接状态
      ▼
确认 READY
      ▼
告知用户可以开始创作
```

## 状态机

| 状态 | 含义 | 下一步 |
| --- | --- | --- |
| `NOT_FOUND` | 没有 `LibTV-wuch` | 创建连接器（名称 + 地址）→ 等授权 |
| `CONNECTED_UNAUTHORIZED` | 连接在，未完成授权 | 不重复创建，引导完成授权，再复查 |
| `READY` | 四项条件全满足 | 结束接入，进入创作 |
| `ERROR` | 连接失败 | 不宣称已连接，返回实际错误，先重新授权/查连接 |

## 就绪条件

必须**同时**满足才算 Ready：

```text
1. 连接器 LibTV-wuch 存在
2. MCP 地址为 https://mcp.liblib.tv/mcp
3. MCP 已成功连接
4. LibTV 账户授权完成
```

## 使用入口

```text
python3 scripts/validate.py                    # 打印固定契约 + 状态机 + 各状态下一步
python3 scripts/validate.py --state READY      # 校验状态枚举，输出裁决与下一步
python3 scripts/validate.py --name X --url Y   # 校验名称/地址是否符合固定契约
python3 scripts/validate.py --config <file>    # 在客户端配置里查找 LibTV 条目（best-effort）
```

## 边界

```text
AI 可以：判断状态 / 给出连接器名与地址 / 引导用户创建与授权 / 校验就绪 / 告诉用户如何开始
AI 不得：伪造连接成功 / 未授权就宣称可创作 / 自行创建连接器（属客户端 UI）/ 改其他 MCP /
         重复创建已有连接 / 在本能力内承担创作（提示词、生成、改图、分镜、参数、评价）
```
