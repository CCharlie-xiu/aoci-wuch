# libtv-mcp-setup

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`libtv-mcp-setup[TI8DH]`

F: 当需要 LibTV 影像创作时，由 AI 尽可能完成 LibTV Remote MCP 配置与连接检查；仅在账户登录/授权时交由用户确认，随后复查就绪状态
R:
A: `method.md`（已验证的配置、排错与就绪判定步骤）；`scripts/validate.py`（契约、状态与配置模式校验）；固定契约：连接器名 `LibTV-wuch`、MCP 地址 `https://mcp.liblib.tv/mcp`；就绪 = 连接器存在 + 地址正确 + 工具已加载 + `doctor` 返回 `status: ready` 且带 `identity`
S: LibTV OAuth 只接受 `http://localhost` / `http://127.0.0.1` 回调，客户端用自定义协议回调（如 Cursor 的 `cursor://`）时直接填 `url` 必定失败（`redirect URI is not allowed`），须改用 `mcp-remote` 桥接；不伪造连接成功状态；`doctor` 未返回 ready 与身份前不得宣称「已可创作」；连接就绪不等于生成/导出已验收；本能力只负责「接入与就绪」，不负责创作方法；不修改其他 MCP；已有有效 LibTV 连接时不重复创建；连接名固定 `LibTV-wuch`，除非用户明确要求改；常规配置由 AI 完成，不推给用户；遵守客户端权限，不绕过阻止；只有登录/账户授权或明确的权限阻断需要用户接手，阻断时说明具体原因与唯一待办步骤

---

## 这是什么

远程 MCP 接入能力：让 AI 在「需要 LibTV 影像创作」时完成**检查 → 配置 → 交给用户授权 → 复查就绪**，然后交给创作任务。

它不实现 LibTV，也不负责怎么创作；只负责把 `LibTV-wuch` 接到可用状态。

## 关键区分

```text
libtv-mcp-setup（本能力）        ≠   LibTV MCP 本身（创作能力）
   「我需要 LibTV」                     创作图片 / 视频
   → 找到/创建连接器                    修改图片 / 生成影像
   → 等用户登录/确认授权                 分镜设计 / 参数优化
   → doctor ready                      …
```

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 使用 LibTV 创作影像 / 生成图片或视频 | 触发 |
| 帮我连接 / 接入 LibTV MCP | 触发 |
| LibTV 在 MCP 列表里看不到 / 连不上 | 触发（走 ERROR 排查） |

已有可用且 `doctor` ready 的 `LibTV-wuch` 时**不重复创建**，直接进入创作。

## 推荐配置（已验证）

```json
"LibTV-wuch": {
  "command": "npx",
  "args": ["-y", "mcp-remote@latest", "https://mcp.liblib.tv/mcp"]
}
```

`mcp-remote` 在本地起 `http://localhost:<port>/oauth/callback` 完成 OAuth，再以 stdio 把 MCP 交给客户端。前提：本机有 `node` / `npx`。

不要用 `{"url": "https://mcp.liblib.tv/mcp"}` 直连——在 Cursor 中实测会被 LibTV 拒绝回调地址，工具永远加载不出来。

## 核心流程

```text
检查 LibTV-wuch ── 工具已加载且 doctor ready ──▶ 直接进入创作
      │
   无 / 直连 url / 报错
      ▼
写入（或改为）推荐配置，只动 LibTV-wuch 一条
      ▼
客户端自动重载 → mcp-remote 自动打开浏览器授权页
      ▼
交给用户：登录 LibTV 并同意授权（唯一人工步骤）
      ▼
复查：工具列表已加载 → 调用 doctor
      ▼
status: ready + identity.userId → READY
```

## 状态机

| 状态 | 判定依据 | 下一步 |
| --- | --- | --- |
| `NOT_FOUND` | 配置中没有 `LibTV-wuch` | 写入推荐配置 → 等授权 |
| `CONNECTED_UNAUTHORIZED` | 配置在，客户端日志显示等待授权 / 只有 `mcp_auth` 工具 | 不重复创建；交给用户在浏览器完成授权，再复查 |
| `READY` | 工具已加载，`doctor` 返回 `status: ready` 且有 `identity` | 结束接入，进入创作 |
| `ERROR` | 连接失败 | 读客户端 MCP 日志定位原因，按 `method.md` 修复后复查 |

## 使用入口

```text
method.md                                        # 具体步骤、日志位置、排错表
python3 scripts/validate.py --config ~/.cursor/mcp.json   # 检查配置模式是否正确
python3 scripts/validate.py --state READY        # 状态枚举校验
```

## 边界

```text
AI 应当：检查现状 / 写入或修复 LibTV-wuch 配置 / 保留其他 MCP / 读日志排错 / 授权后调用 doctor 复查 / 告诉用户可以开始
AI 不得：伪造连接成功 / doctor 未 ready 就宣称可创作 / 绕过客户端权限 / 改其他 MCP /
         重复创建已有连接 / 在本能力内承担创作（提示词、生成、改图、分镜、参数、评价）
```
