# Excel Desktop Backend

桌面级后端。仅在任务明确需要真实 Excel 时使用。

## 项目

`sbroenne/mcp-server-excel`（ExcelMcp，MIT）

## 用途

通过 Excel 官方 COM API 驱动**真实运行的 Excel 程序**。

```text
AI → MCP → ExcelMcp → Excel COM → Excel.exe
```

与文件级不同：能刷新 Power Query、重算公式、求值 DAX、跑 VBA 与 Python `=PY()`，并保留 PivotTable、图表、宏、数据模型与工作簿格式。因为由 Excel 本身执行，用户可以**实时看到**操作过程。

## 前置（硬性）

```text
Windows 10+
Microsoft Excel 2016+（桌面版）
交互式 Windows 桌面（Excel 对登录用户可用）
```

**非 Windows 一律不可用**（Linux / macOS / 服务器批处理均不支持）。这是本后端的第一道门槛。

## 检查顺序

```text
1. 操作系统是否 Windows
2. Microsoft Excel 是否安装（2016+）
3. ExcelMcp 是否已装（excelcli / VS Code 扩展 / npm / mcp-excel.exe）
4. 当前 AI 客户端配置里是否有 mcpServers.excel-mcp
5. 可否握手（validate.py --backend desktop）
```

状态机：

```text
READY                 Windows + Excel + MCP + 已配
MCP_NOT_CONFIGURED    MCP 已装，客户端没配
MCP_MISSING           Windows + Excel，无 MCP
EXCEL_MISSING         Windows，无 Excel
UNSUPPORTED_PLATFORM  非 Windows
```

## 安装（四通道，均为官方）

```text
VS Code      安装扩展 sbroenne.excel-mcp（官方称最简，捆绑自带服务器）
npm          npx -y @sbroenne/mcp-server-excel@latest
独立 exe     ExcelMcp-MCP-Server-{version}-windows.zip → mcp-excel.exe（自包含，免 .NET；仅 x64）
MCPB         excel-mcp-{version}.mcpb（拖入 Claude Desktop，需先装 Node.js LTS）
CLI          excelcli（同一 Core，token 更省，供脚本/编码 Agent）
NuGet        dotnet tool install --global Sbroenne.ExcelMcp.McpServer（需 .NET 10，备用）
```

npm 包按架构自动选 `@sbroenne/mcp-server-excel-win32-x64` 或 `-win32-arm64`。装 npm 包时**不要** `--omit=optional`。

## 配置

键名 `excel-mcp`：

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

VS Code / Visual Studio 用 `servers` 键（非 `mcpServers`）。用独立 exe 时 `command` 改为 `mcp-excel` 或完整路径，省略 `args`。

## 能力

60 个 MCP 工具 / 31 个功能域 / 388 个操作，覆盖：

```text
数据与分析   Power Query、DAX、Power Pivot、Excel 表格、PivotTable、数据连接
单元格与簿  区域、公式、格式、工作表、文件、计算、命名区域
图表与视觉   图表、切片器、条件格式、截图、图形、迷你图
自动化进阶   VBA、Python in Excel、目标求解、方案、数据表、窗口、XML 映射
```

## 约束

- **独占访问**：ExcelMcp 自动化工作簿时需要独占访问，**操作前须关闭已打开的工作簿**
- 需要交互式桌面，不能在无桌面的服务器/CI 上批处理
- 与文件级互不替代：普通文件读写用文件级更轻，不要为简单任务启动 Excel

## 层级提示

`sbroenne` 官方另有名为 `excel-mcp` 的 **Agent Skill**，教 AI 如何使用 ExcelMcp 工具。它是本后端之下的一层，不是本能力，也不是 MCP Server 本体。
