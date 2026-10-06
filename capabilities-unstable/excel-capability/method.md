# method

`excel-capability` 的执行细节。认知层见 `index.md`。
两个后端的事实取自各自项目官方 README / 安装文档（2026-10 核实），未核实的内容一律标注「文档未提及」。

## 决策树（完整）

```text
用户提出 Excel 任务
        │
        ▼
   是否 Excel 任务？──否──▶ 不触发本能力
        │
       是
        ▼
 是否明确要求桌面/电脑操作？
        │
   ┌────┴────┐
   是        否
   │         │
   ▼         ▼
Desktop   是否需要 Excel 原生能力？
             │
        ┌────┴────┐
        是        否
        │         │
        ▼         ▼
     Desktop     File
```

## 触发词 → 后端

| 用户语义 | 后端 |
| --- | --- |
| 打开 Excel / 打开电脑上的 Excel / 操作桌面上的 Excel | Desktop（第一类：明确要求） |
| 操作我现在打开的 Excel / 让我看着你操作 / 在 Excel 软件里面操作 / 帮我点 Excel | Desktop（第一类） |
| 帮我操作电脑里的 Excel | Desktop（第一类） |
| Power Query / Power Pivot / DAX | Desktop（第二类：原生能力） |
| VBA / 刷新连接 / 刷新查询 / Excel 原生计算 / 操作当前打开的工作簿 | Desktop（第二类） |
| 分析 / 统计 / 去重 / 改表头 / 建 Sheet / 找 Top N / 普通数据处理 | File（默认） |

## 后端对照

| | File | Desktop |
| --- | --- | --- |
| 项目 | `haris-musa/excel-mcp-server` | `sbroenne/mcp-server-excel`（ExcelMcp） |
| 实现 | openpyxl 直接读写文件 | Excel COM 驱动真实 Excel.exe |
| 依赖 | 仅需 `uv`；**不需要 Microsoft Excel** | Windows 10+、Excel 2016+、交互桌面 |
| 平台 | 跨平台 | 仅 Windows |
| 公式 | 只存储不计算 | 由 Excel 真实计算 |
| PivotTable | 无真实透视表（`create_summary_table` 是静态汇总） | 真实 PivotTable |
| 适合 | 读/写/改单元格、格式、Sheet、表格、图表、条件格式 | Power Query、Power Pivot/DAX、VBA、`=PY()`、刷新连接、实时可见操作 |

## 安装规则

**核心原则：优先使用第三方项目自己的官方安装方式，不自己重新包装安装器。**

### File 后端

```text
前置：uv（含 uvx）
安装：无需单独安装包，客户端配置里由 uvx 按需拉取 excel-mcp-server
配置：command=uvx，args=["excel-mcp-server","stdio","--allow-dir","<目录>"]
```

### Desktop 后端（ExcelMcp，四通道，均为官方）

```text
VS Code     安装扩展 sbroenne.excel-mcp（官方称最简，捆绑自带服务器）
npm         npx -y @sbroenne/mcp-server-excel@latest
独立 exe    ExcelMcp-MCP-Server-{version}-windows.zip → mcp-excel.exe（自包含，免 .NET）
MCPB        excel-mcp-{version}.mcpb（拖入 Claude Desktop，需先装 Node.js LTS）
CLI         excelcli（同一 Core，token 更省，供脚本/编码 Agent）
```

## 客户端配置位置

| 客户端 | 配置位置 | 检测方式 |
| --- | --- | --- |
| WorkBuddy | `~/.workbuddy-ai/mcp.json` | `mcpServers.<键>` |
| Cursor | `~/.cursor/mcp.json` | `mcpServers.<键>` |
| Claude Code | 项目 `.mcp.json`、用户 `~/.claude.json` | `mcpServers.<键>` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `mcpServers.<键>` |
| Codex | `~/.codex/config.toml` | `[mcp_servers.<键>]` |
| VS Code + Copilot | `settings.json` 的 `mcp.servers` | `mcp.servers.<键>` |
| DeepSeek Harness | `$DSH_HOME/profiles/<profile>/cordis.patch.yml` | `serverName: <键>` |

**GUI 客户端不一定继承 shell PATH**：`uvx` / `npx` 必须写展开后的绝对路径（`which uvx` 的输出），不能写裸命令。

## 配置片段

File 后端（键名 `excel`）：

```json
{
  "mcpServers": {
    "excel": {
      "command": "uvx",
      "args": ["excel-mcp-server", "stdio", "--allow-dir", "/path/to/workbooks"]
    }
  }
}
```

Desktop 后端（键名 `excel-mcp`）：

```json
{
  "mcpServers": {
    "excel-mcp": {
      "command": "npx",
      "args": ["-y", "@sbroenne/mcp-server-excel@latest"]
    }
  }
}
```

用独立 exe 时：`command` 改为 `mcp-excel` 或完整路径 `C:\Tools\ExcelMcp\mcp-excel.exe`，省略 `args`。

## 升级机制

```text
File 执行中报「无法可靠完成」
   ↓
判断任务是否命中桌面级条件（原生能力）
   ↓
命中 → 检查桌面级三态 → 可用则切 Desktop
   ↓
不可用 → 告诉用户：该任务需要 Windows + Excel 2016+，当前环境无法完成
```

升级必须**如实告知**：说明为什么升、升到了哪、或为什么升不了。不得静默失败，也不得在非 Windows 上假装桌面级可用。

## 交付话术

**File READY**

```text
已就绪（文件级 Excel）。现在可以直接说：
「把这个 <文件名> 按 <维度> 统计一下」。
```

**装完待重启**

```text
已完成：把 <后端> MCP 写进 <配置文件> 的 mcpServers.<键>（绝对路径）。
需要你做：<重启/重载客户端>。之后直接说「帮我处理这个 Excel」。
```

**需升级但环境不支持**

```text
这个任务要用 Excel 原生能力（<Power Query/VBA/...>），只有桌面级后端能可靠完成。
桌面级需要 Windows 10+ 与 Excel 2016+，当前系统是 <平台>，无法完成。
可选：改用文件级能做到的部分，或换到 Windows 机器执行。
```

## 本机实测（2026-10-06）

```text
platform = Darwin（macOS）
uv / uvx   /Users/wuch/.local/bin/uv、uvx  已装
npx / node 已装
brew       已装
File 后端  uvx 可用；客户端 Cursor/Codex 配置存在，均无 excel 条目
Desktop 后端 UNSUPPORTED_PLATFORM（非 Windows，不可用）
```
