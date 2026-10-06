# method

`libtv-mcp-setup` 的执行细节。认知层见 `index.md`。
固定契约取自用户给定配置（2026-10 核实地址在线：`GET https://mcp.liblib.tv/mcp` 返回 `401`，端点存在、需授权）。

## 固定配置

| 项目 | 值 |
| --- | --- |
| Connector Name | `LibTV-wuch` |
| MCP URL | `https://mcp.liblib.tv/mcp` |
| Provider | LibTV |
| 用途 | 影像创作 |
| 传输 | Remote MCP（HTTP） |

**这些值不得自行更改**，除非用户明确要求。名称固定 `LibTV-wuch`。

## 状态判断与操作

### NOT_FOUND

没有 `LibTV-wuch`。

```text
1. 在客户端新建一个远程 MCP / Connector
2. 名称填 LibTV-wuch
3. 地址填 https://mcp.liblib.tv/mcp
4. 保存
5. 等待用户完成 LibTV 账户授权
```

### CONNECTED_UNAUTHORIZED

连接存在，但未完成 LibTV 授权。

```text
1. 不重复创建连接
2. 引导用户完成账户授权
3. 授权完成后重新检查状态
```

### READY

四项条件同时满足：

```text
连接器存在 + 地址正确 + MCP Connected + LibTV Account Authorized
```

结束接入流程，进入用户的影像创作任务。

### ERROR

```text
- 不宣称已经连接
- 返回实际错误
- 优先让用户重新授权或检查连接
- 不修改其他 MCP 配置
```

## 用户交互话术

**首次接入**

```text
帮你连接 LibTV Remote MCP。

1. 新建一个名为 LibTV-wuch 的连接器
2. 连接地址填写 https://mcp.liblib.tv/mcp
3. 保存后完成 LibTV 账户授权

完成后告诉我，我再继续。
```

**授权完成后**

```text
LibTV 已连接并完成授权，可以开始创作了。
```

**连接失败**

```text
LibTV 连接没有成功，当前状态是 <ERROR 详情>。
建议先重新完成一次账户授权；如果仍失败，检查地址是否为 https://mcp.liblib.tv/mcp。
我没有改动其他任何 MCP 配置。
```

## 校验

```text
python3 scripts/validate.py                    # 契约 + 状态机 + 下一步
python3 scripts/validate.py --state READY      # 状态枚举校验 + 裁决
python3 scripts/validate.py --name LibTV-wuch --url https://mcp.liblib.tv/mcp
python3 scripts/validate.py --config ~/.cursor/mcp.json
```

`validate.py` **只做配置常量与状态规则校验**，不握手、不创建连接器、不假装能操作客户端 UI。

## 边界

本能力不负责：影像提示词设计 / 图片生成 / 视频生成 / 画面修改 / 分镜设计 / LibTV 参数优化 / 生成结果评价。
这些属于后续独立能力或 LibTV MCP 本身提供的执行能力。

## 本机实测（2026-10-06）

```text
地址探测   GET https://mcp.liblib.tv/mcp → 401（在线，需授权）
客户端     WorkBuddy / Cursor / Codex / Windsurf 配置均无 libtv|liblib 条目
状态       NOT_FOUND（本机尚无 LibTV 连接）
```
