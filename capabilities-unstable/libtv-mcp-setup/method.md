# method

`libtv-mcp-setup` 的执行细节。认知层见 `index.md`。

## 固定配置

| 项目 | 值 |
| --- | --- |
| Connector Name | `LibTV-wuch` |
| MCP URL | `https://mcp.liblib.tv/mcp` |
| 接入方式 | `npx -y mcp-remote@latest https://mcp.liblib.tv/mcp`（stdio 桥接） |
| 授权 | OAuth 2.1 + PKCE，动态注册客户端，回调须为 `http://localhost` / `http://127.0.0.1` |
| 前提 | 本机有 `node` / `npx` |

名称与地址不得自行更改，除非用户明确要求。

## 为什么必须桥接

LibTV 授权服务（`https://mcp.liblib.tv/register`）对回调地址做白名单：

```text
cursor://anysphere.cursor-mcp/oauth/callback   → invalid_redirect_uri（拒绝）
http://localhost:<port>/callback               → 注册成功
http://127.0.0.1:<port>/callback               → 注册成功
```

Cursor 直连 `url` 时用 `cursor://` 回调，因此日志报 `redirect URI is not allowed`，授权页都不会弹出，MCP 列表里也看不到 LibTV 工具。`mcp-remote` 用本地 HTTP 回调，正好满足白名单。

其他客户端：若其远程 MCP 授权回调也是自定义协议，同样用桥接；若回调本身就是 localhost，可直连 `url`，但仍以 `doctor` 复查为准（未逐一实测）。

## 步骤

### 1. 检查现状

```text
- 读取客户端 MCP 配置（Cursor：~/.cursor/mcp.json，项目级 .cursor/mcp.json）
- python3 scripts/validate.py --config <配置文件>   # 判断 NOT_FOUND / 直连 url / 桥接
- 查看 LibTV-wuch 的工具是否已加载；已加载就直接调用 doctor
```

### 2. 写入或修复配置（NOT_FOUND / 直连 url）

只增补或替换 `mcpServers.LibTV-wuch` 这一条，保留其他条目，不输出其中的密钥：

```json
"LibTV-wuch": {
  "command": "npx",
  "args": ["-y", "mcp-remote@latest", "https://mcp.liblib.tv/mcp"]
}
```

写完用 `python3 -m json.tool <配置文件>` 确认 JSON 合法。Cursor 会自动重载 `mcp.json`，无需重启。

### 3. 交给用户授权（唯一人工步骤）

重载后 `mcp-remote` 会自动打开浏览器的 LibTV 授权页。告诉用户：登录 LibTV 并点同意。

浏览器没弹出时，从客户端 MCP 日志里找 `Please authorize this client by visiting:` 后面的链接发给用户。

授权成功后 token 缓存在 `~/.mcp-auth/mcp-remote-*/`，之后重启客户端不需要再授权。

### 4. 复查就绪

```text
1. LibTV-wuch 工具列表已加载（实测 48 个业务工具，含 doctor / generate_video / generation_submit 等）
2. 调用 doctor（无参数）
3. 返回 status: "ready" + connectionStateReady: true + identity.userId → READY
```

`doctor` 只证明身份与连接就绪；首次生成/导出仍以实际任务结果为准。

## 排错

Cursor 日志位置：

```text
~/Library/Application Support/Cursor/logs/<最新时间戳>/mcp-server-user-LibTV-wuch.log
```

| 日志 / 现象 | 原因 | 处理 |
| --- | --- | --- |
| `redirect URI is not allowed` | 直连 `url`，回调被 LibTV 拒绝 | 改为桥接配置 |
| `Waiting for authorization...` | 已打开授权页，用户未完成 | 交给用户授权；必要时发日志里的授权链接 |
| `npx: command not found` / spawn 失败 | 本机无 Node | 告知需安装 Node（如 `brew install node`），属环境阻断 |
| 工具已加载但调用返回 401 | token 失效或被撤销 | 删除 `~/.mcp-auth/mcp-remote-*/` 中对应缓存后重载，重新授权（未实测） |
| 只看到 `mcp_auth` 一个工具、状态 error | 连接未建立 | 先看日志定位，不要反复调用 `mcp_auth`（直连模式下实测会 30 秒超时） |

服务端连通性自检（不需要授权）：

```bash
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://mcp.liblib.tv/mcp \
  -H 'Content-Type: application/json' -d '{}'
# 401 = 服务在线、需授权；超时或 5xx = 服务端问题，属外部阻断
```

## 用户交互话术

**首次接入**

```text
我来配置 LibTV 连接。浏览器会弹出 LibTV 授权页，请登录并点同意，完成后告诉我，我再复查。
```

**就绪后**

```text
LibTV 已连接并完成授权（doctor: ready），可以开始创作了。
```

**失败时**

```text
LibTV 连接没有成功，原因是 <日志中的实际错误>。我已 <已执行的修复>；现在只需要你 <唯一待办步骤>，之后我继续复查。
```

## 校验脚本

```text
python3 scripts/validate.py                              # 契约 + 状态机
python3 scripts/validate.py --state READY                # 状态枚举校验
python3 scripts/validate.py --name LibTV-wuch --url https://mcp.liblib.tv/mcp
python3 scripts/validate.py --config ~/.cursor/mcp.json  # 配置模式：bridge / direct-url / not-found
```

脚本只读、不联网、不改配置；输出会脱敏 token 等字段。

## 边界

本能力不负责：影像提示词设计 / 图片生成 / 视频生成 / 画面修改 / 分镜设计 / LibTV 参数优化 / 生成结果评价。

## 实测记录（2026-10-08，macOS + Cursor）

```text
直连 url          → redirect URI is not allowed，工具不加载
改 mcp-remote 桥接 → 自动弹出授权页，用户授权后工具加载
doctor            → status: ready，identity.userId 存在，toolRegistry 48 个
```

历史快照，每次执行仍须重新检查。
