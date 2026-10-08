# excel-capability

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`excel-capability[TF8SH]`

F: 按用户的 Excel 任务选择文件级或桌面级后端并打通，默认文件级，仅在必要时升级桌面级
R:
A: `scripts/check_file.py`（文件级后端可用性）；`scripts/check_desktop.py`（桌面级后端三态）；`scripts/validate.py`（MCP stdio 握手验证可调用）；`backends/file.md` / `backends/desktop.md`（后端安装、配置、工具与限制）
S: 默认走文件级，不得因出现「Excel」就升级桌面级；桌面级仅在 Windows 10+ + Excel 2016+ + 交互桌面可用，非 Windows 一律不可用；文件级不依赖 Microsoft Excel；文件级公式只存储不计算、不支持 `.xls`/`.csv` 与真实 PivotTable、编辑可能丢失形状/切片器等 openpyxl 不认识的特性；桌面级需独占访问，操作前须关闭已打开的工作簿；只新增目标 MCP 键、不动无关配置、不伪造已安装状态；文件级无法可靠完成时允许升级桌面级，并如实告知

---

## 这是什么

让 AI 在「用户要处理 Excel」时，自己判断该走哪条后端，并把那条通路打通、验证、交付。

它对 AI 的唯一入口是一句自然语言：

> 「帮我处理这个 Excel。」

内部有**两个实现后端**，本能力只做**选择 + 打通 + 验证**，不重新实现 MCP、不自己写 Excel 编辑器或 COM 自动化：

```text
                    excel-capability
                          │
            ┌─────────────┴─────────────┐
            │                           │
      File Backend                Desktop Backend
      haris-musa/excel-mcp-server sbroenne/mcp-server-excel
      openpyxl · 无 Excel          Windows COM · 真实 Excel
            │                           │
       默认优先使用                 明确需要时使用
```

两个后端是本能力内部的两条路，**不是两个独立能力**——所以它们写在 `backends/` 下，不各自立目录、不进 R。

## 什么时候用

用户提出 Excel 任务且当前环境没有可直接调用的 Excel MCP 时触发：

| 用户说 | 判定 |
| --- | --- |
| 帮我分析这个 Excel | Excel 任务 |
| 统计每个月销售额 | Excel 任务 |
| 把这个 xlsx 去重 / 改表头 / 建汇总 Sheet | Excel 任务 |
| 找出销售额最高的 100 人 | Excel 任务 |
| 打开我电脑上的 Excel 帮我改 | Excel 任务 + 桌面意图 |
| 刷新这个工作簿的 Power Query | Excel 任务 + 桌面意图 |

已有可用 Excel MCP 时**不要**触发本能力，直接调用该 MCP 的工具。

## 后端选择

```text
用户提出 Excel 任务
        │
        ▼
 是否明确要求桌面/电脑操作？
   （打开 Excel / 操作电脑上的 Excel /
     让我看着你操作 / 在 Excel 软件里操作）
        │
   ┌────┴────┐
   是        否
   │         │
   ▼         ▼
Desktop   任务是否要求 Excel 原生能力？
          （Power Query / Power Pivot / DAX /
            VBA / 刷新连接或查询 / Excel 原生计算 /
            操作当前已打开的工作簿）
              │
         ┌────┴────┐
         是        否
         │         │
         ▼         ▼
      Desktop     File
```

**Desktop 优先于 File，但只有满足 Desktop 条件才升级。** 默认永远是 File。

## 升级机制

File 执行中若发现无法可靠完成（工作簿依赖 Excel 原生功能），**不要直接失败**：

```text
Excel 任务 → 默认 File
               │
        ┌──────┴──────┐
       成功          能力不足
        │             │
        ▼             ▼
      完成      尝试 Desktop
                    │
             ┌──────┴──────┐
           可用          不可用
             │             │
             ▼             ▼
           完成      告诉用户需 Windows + Excel
```

## 使用入口

```text
python3 scripts/check_file.py                 # 只读：文件级后端可用性 + 下一步 + 配置片段
python3 scripts/check_desktop.py              # 只读：桌面级后端三态（OS / Excel / MCP / 客户端）
python3 scripts/validate.py --backend file    # 真实 MCP stdio 握手，报工具数量
```

状态机（脚本 `state` 字段）：

| 后端 | 状态 | 含义 | 下一步 |
| --- | --- | --- | --- |
| file | `READY` | uvx 可用且客户端已配 `excel` | 直接用文件级 MCP 工具 |
| file | `MCP_NOT_CONFIGURED` | uvx 可用，客户端没配 | 写 `mcpServers.excel` |
| file | `UV_MISSING` | 无 uv / uvx | 先装 uv |
| desktop | `READY` | Windows + Excel + MCP + 已配 | 直接用桌面级 MCP 工具 |
| desktop | `MCP_NOT_CONFIGURED` | MCP 在，客户端没配 | 写 `mcpServers.excel-mcp` |
| desktop | `MCP_MISSING` | Windows + Excel，无 MCP | 装 ExcelMcp |
| desktop | `EXCEL_MISSING` | Windows，无 Excel | 引导装 Excel 2016+ |
| desktop | `UNSUPPORTED_PLATFORM` | 非 Windows | 只能走 File |

## 安装规则

**优先使用项目自己的官方安装方式，不自己重新包装安装器。**

```text
File    ：安装 uv → 客户端配置里用 uvx excel-mcp-server stdio --allow-dir <目录>
Desktop ：VS Code 扩展 sbroenne.excel-mcp / npx -y @sbroenne/mcp-server-excel@latest /
          ExcelMcp-MCP-Server-{version}-windows.zip 内的 mcp-excel.exe / excel-mcp-{version}.mcpb
```

配置片段、工具清单与限制见 `backends/file.md`、`backends/desktop.md`。

## 边界

```text
AI 可以：判断后端 / 检查环境 / 编排官方安装 / 只新增目标 MCP 键 / 握手验证 / 告诉用户怎么用
AI 不得：默认启动桌面 Excel / 因出现「Excel」就选 Desktop / 在非 Windows 上声称桌面级可用 /
         改或删无关 MCP 配置 / 伪造 MCP 已安装或已调用 / 自己实现 Excel 编辑器、parser 或 COM 自动化
```

本能力**不实现** Excel 处理本身：文件级能力由 `haris-musa/excel-mcp-server` 提供，桌面级由 `sbroenne/mcp-server-excel` 提供。

> 层级提示：`sbroenne` 官方另有名为 `excel-mcp` 的 **Agent Skill**（教 AI 如何使用 ExcelMcp），与本能力不同层——本能力负责「判断何时需要 Excel → 选 File/Desktop → 检查/安装/配置/验证 → 开始使用」，Skill 只是 Desktop 后端之下的一层。
