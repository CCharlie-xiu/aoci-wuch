# method

`dbx-mcp-setup` 的执行细节。认知层见 `index.md`。
命令与工具名均取自 DBX 官方文档（2026-10 核实），未记载的内容一律标注「文档未提及」。

## 三个独立状态

```text
A. DBX 本体      /Applications/DBX.app 或 dbx CLI
B. DBX MCP       ~/.dbx/bin/dbx-mcp（原生）或 brew/npm 路径
C. AI 客户端配置  mcpServers.dbx 是否真的写进了当前客户端
```

A 有 ≠ B 有 ≠ C 有。逐项检查，不要互相推断。

## 流程

| 步 | 动作 | 命令 |
| --- | --- | --- |
| 1 | 检查 DBX 桌面端 / CLI | `check.py` → `dbx_desktop` / `dbx_cli` |
| 2 | 检查 MCP | `check.py` → `dbx_mcp` |
| 3 | 检查客户端是否已配 | `check.py` → `clients[].has_dbx` |
| 4 | 缺 MCP → 装 | `install.py --confirm`（先给用户看命令） |
| 5 | 取绝对路径 | `install.py` 输出的 `~/.dbx/bin/dbx-mcp` 展开路径 |
| 6 | 缺配置 → 写 `mcpServers.dbx` | 只新增这一个键，其余原样保留 |
| 7 | 重启/重载客户端 | 客户端要求重启才能发现 MCP |
| 8 | 验证 | `validate.py`；再用只读工具试一次 |
| 9 | 交付 | 状态 + 已做 + 待办 + 用法 |

## 客户端配置位置

| 客户端 | 配置位置 | 检测方式 |
| --- | --- | --- |
| WorkBuddy | `~/.workbuddy-ai/mcp.json` | `mcpServers.dbx` |
| Cursor | `~/.cursor/mcp.json` | `mcpServers.dbx` |
| Claude Code | 项目 `.mcp.json`、用户 `~/.claude.json` | `mcpServers.dbx` |
| Windsurf | MCP 配置（`~/.codeium/windsurf/mcp_config.json`） | `mcpServers.dbx` |
| Codex | `~/.codex/config.toml` | `[mcp_servers.dbx]` |
| VS Code + Copilot | `settings.json` 的 `mcp.servers` | `mcp.servers.dbx` |
| DeepSeek Harness | `$DSH_HOME/profiles/<profile>/cordis.patch.yml`（默认 `~/.dsh`） | `serverName: dbx` |

文档只给出 Claude Code / Cursor / Windsurf / VS Code / DSH；原生安装器还会打印 Codex、ZCode 与通用 MCP 配置。ZCode 的路径文档未提及。

## 配置片段

原生通道（推荐，用 `install.py` 输出的绝对路径）：

```json
{
  "mcpServers": {
    "dbx": {
      "command": "/Users/<用户名>/.dbx/bin/dbx-mcp",
      "args": []
    }
  }
}
```

npm 通道（文档示例）：

```json
{
  "mcpServers": {
    "dbx": {
      "command": "npx",
      "args": ["-y", "@dbx-app/mcp-server"]
    }
  }
}
```

从 npm 迁原生时：把 `command` 换成绝对路径，**删掉** npx / `-y` / 包名参数，`env` 保留。

## MCP 工具名（全部带 `dbx_` 前缀）

```text
只读路径：dbx_list_connections → dbx_list_tables → dbx_describe_table → dbx_execute_query
唤起页面：dbx_open_table（在桌面端打开表）  dbx_execute_and_show（执行并在 DBX 中展示）
```

完整工具集共 25 个，含连接管理、事务、Redis、Salesforce 写入等。本能力只用只读路径。

## 唤起页面

| 目的 | 方式 |
| --- | --- |
| 打开/聚焦 DBX | `open 'dbx://open'` |
| 新建连接并预填 | `open 'dbx://connection/new?type=mysql&host=...&user=...&password=...'` |
| 更新已存连接 | `open 'dbx://connection/new?id=<连接ID>&user=...'`（ID 取自 `dbx_list_connections`） |
| MCP 已连时打开表 | 直接用 `dbx_open_table`，不要自己拼深链 |

深链会暴露密码：不要写进日志、shell 历史、工单或聊天消息。

## 权限边界

- 权限模式：`只读` / `数据读写` / `完全访问`，回退顺序 `单库 → 连接默认 → 全局`
- 权威策略在 **DBX 设置 → MCP**，每次请求重新读取，服务端强制执行工具白名单
- 新版 Server 不允许用 `DBX_MCP_ALLOW_WRITES` / `DBX_MCP_ALLOW_DANGEROUS_SQL` 放宽中央策略
- CLI 写入需显式 `--allow-writes`，危险 SQL 还要 `--allow-dangerous-sql`；生产库一律拦截
- 连接自身只读、生产库保护、数据库账号权限，在任何模式下都是上限

## 另一条路：DBX CLI + 官方 Agent Skill

面向能跑 shell 的 Agent（Codex / Claude Code），与 MCP 是两条独立通路：

```text
npm install -g @dbx-app/cli   /  brew tap t8y2/tap && brew install dbx-cli
dbx agent setup               # 装官方 Skill 到 ~/.agents/skills/dbx
dbx agent status --json
```

常用：`dbx doctor` / `dbx capabilities` / `dbx connections list --json` /
`dbx schema describe local users --json` / `dbx query local "select count(*) from users" --json` /
`dbx open local users`（需桌面端运行，否则 `DBX_NOT_RUNNING`）。

## 交付话术

**READY**

```text
DBX MCP 已就绪（<客户端>）。现在可以直接说：
「看一下 <连接名> 的 <表名>」。
```

**装完待重启**

```text
已完成：安装 DBX MCP（原生通道），并把绝对路径写进 <配置文件> 的 mcpServers.dbx。
需要你做：<重启/重载客户端>。之后直接说「查看 <连接> 的 <表>」。
```

**DBX 都没有**

```text
当前环境没有 DBX。DBX 是这次查看数据库要用到的工具。
我可以执行官方安装命令帮你装上（<命令>），需要你确认。
装完我再配 MCP。你也可以自己先装好 DBX 桌面端。
```

**未授权连接**

```text
DBX MCP 已连上，但这次要访问的连接还没暴露给 MCP。
请在 DBX 设置 → MCP 里把该连接加入允许范围（并选择执行权限）。
```

## 本机实测（2026-10-06）

```text
state = MCP_MISSING
DBX 桌面端  /Applications/DBX.app  已装，未运行
DBX CLI     未安装
DBX MCP     未安装（无 ~/.dbx/bin）
客户端      Cursor、Codex 配置存在，均无 dbx 条目
```
