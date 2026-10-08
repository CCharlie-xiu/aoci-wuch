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

没有 `LibTV-wuch`。AI 应先检查当前会话的 MCP 管理入口、客户端 UI 与相应客户端配置位置，并选择当前可用且获准的方式自行添加。配置文件方式须先读取并解析现有文件，只增补 `mcpServers.LibTV-wuch`，保留其他 MCP 条目和设置；不得覆盖整个文件或输出其中的密钥。保存后按客户端要求重载/重启，再检查配置与连接状态。

```text
1. AI 使用当前可用且获准的 MCP 管理入口、客户端 UI 或配置文件创建远程 MCP
2. 名称为 LibTV-wuch，地址为 https://mcp.liblib.tv/mcp
3. 保留所有其他配置；按客户端要求重载/重启
4. 验证连接器存在、地址正确，并读取实际连接/授权状态
5. 只有到达登录或账户授权步骤时，才暂停并交给用户完成
```

### CONNECTED_UNAUTHORIZED

连接存在，但未完成 LibTV 授权。

```text
1. 不重复创建连接
2. 尽可能打开客户端提供的授权流程；登录、账号选择和授权确认交给用户
3. 授权完成后重新检查状态；未能自动观察完成时，请用户告知授权已完成后继续复查
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
- 先读取错误并检查当前连接配置；AI 自行修复可安全修复的问题，再重载并复查
- 只有需要用户登录/重新授权或环境权限阻断时才交接，并说明具体状态
- 不修改其他 MCP 配置
```

## 用户交互话术

**首次接入**

```text
我会先替你配置并检查 LibTV 连接。到 LibTV 登录/授权时，我会停下来交给你确认；授权后我会继续复查连接状态。
```

不得在 `NOT_FOUND` 时仅给出手动编辑 JSON 的说明并要求用户从头配置。仅当当前环境确实不允许 AI 访问所需 UI/文件时，才说明具体阻断，并给出最小待办动作；配置成功后仍应由 AI 继续验证。

**授权完成后**

```text
LibTV 已连接并完成授权，可以开始创作了。
```

**连接失败**

```text
LibTV 连接没有成功，当前状态是 <ERROR 详情>。我已检查/处理 <已执行的修复>；目前只需要你完成 <登录/授权或明确的权限阻断步骤>，之后我会继续复查。
```

## 校验

```text
python3 scripts/validate.py                    # 契约 + 状态机 + 下一步
python3 scripts/validate.py --state READY      # 状态枚举校验 + 裁决
python3 scripts/validate.py --name LibTV-wuch --url https://mcp.liblib.tv/mcp
python3 scripts/validate.py --config ~/.cursor/mcp.json
```

`validate.py` **只做配置常量与状态规则校验**，不握手、不创建连接器。其能力边界不代表执行本能力的 AI 不能通过其他获准入口配置连接器。`--config` 输出不得泄露配置文件中的 token、密码或其他密钥。

## 边界

本能力不负责：影像提示词设计 / 图片生成 / 视频生成 / 画面修改 / 分镜设计 / LibTV 参数优化 / 生成结果评价。
这些属于后续独立能力或 LibTV MCP 本身提供的执行能力。

## 本机实测（2026-10-06）

以下只是 2026-10-06 的历史快照，不代表当前状态；每次执行时都要重新检查，不能据此跳过配置或复查。

```text
地址探测   GET https://mcp.liblib.tv/mcp → 401（在线，需授权）
客户端     WorkBuddy / Cursor / Codex / Windsurf 配置均无 libtv|liblib 条目
状态       NOT_FOUND（本机尚无 LibTV 连接）
```
