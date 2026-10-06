# Excel File Backend

文件级后端。默认后端。

## 项目

`haris-musa/excel-mcp-server`（PyPI：`excel-mcp-server`，MIT）

## 用途

直接读写 Excel 文件，不经任何 Excel 程序。

```text
xlsx / xlsm / xltx / xltm
        ↓
   MCP Server
        ↓
    openpyxl
        ↓
   读取 / 修改
```

## 前置

- `uv`（含 `uvx`）。**不要求 Microsoft Excel，不要求 Windows。**
- 可选：Python 3.11+（`uvx` 会自动管理，一般无需手动装）

## 检查

```text
1. uv / uvx 是否存在
2. 客户端配置里是否已有 mcpServers.excel
3. 可否握手（validate.py --backend file）
```

状态机：

```text
READY               uvx 可用 + 客户端已配
MCP_NOT_CONFIGURED  uvx 可用，客户端没配
UV_MISSING          无 uv / uvx
```

## 安装

无需单独安装 MCP 包，客户端配置里由 `uvx` 按需拉取。仅需先装 `uv`：

```text
macOS / Linux   curl -LsSf https://astral.sh/uv/install.sh | sh
Windows         powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
Homebrew        brew install uv
```

## 配置

键名 `excel`：

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

关键参数：

| 参数 | 环境变量 | 默认 | 含义 |
| --- | --- | --- | --- |
| `--allow-dir DIR` | `EXCEL_FILES_PATH` | 无（stdio） | 只允许打开该目录内的工作簿；可重复 |
| `--read-only` | `EXCEL_MCP_READ_ONLY=1` | 关 | 只提供不改文件的工具 |
| `--max-file-mb N` | | 100 | 单个工作簿上限 |

不给 `--allow-dir` 时任何绝对路径都可访问。**给桌面/客户端用建议显式指定 `--allow-dir`。**

## 验证

```text
python3 scripts/validate.py --backend file
```

真实 stdio 握手（initialize → tools/list），返回工具数量即视为可调用。

## 工具（26 个）

```text
工作簿  create_workbook  describe_workbook  list_workbooks  export_workbook  import_workbook
工作表  describe_sheet  create_sheet  rename_sheet  copy_sheet  delete_sheet
        insert_rows_or_columns  delete_rows_or_columns
单元格  read_range  write_range  clear_range  copy_range  find_cells
格式    format_range  merge_cells  set_sheet_layout  add_conditional_format  add_data_validation
对象    create_table  create_chart  create_summary_table
宏      read_vba（只读，从不执行）
```

## 限制（必须如实告知用户）

- **公式只存储不计算**：`read_range` 的 values 模式返回 Excel 上次保存的结果；本后端刚写入的公式在文件被 Excel/LibreOffice 打开保存前读为空
- **不支持 `.xls` 与 `.csv`**：仅 `.xlsx` / `.xlsm` / `.xltx` / `.xltm`
- **无真实 PivotTable**：`create_summary_table` 写的是静态汇总
- **增删行列不更新**引用它们的公式、图表、表格
- **编辑可能丢失** openpyxl 不认识的特性（形状、切片器、部分嵌入对象）；图片、图表、表格与 `.xlsm` 宏会保留
- 单次调用最多处理 10 万单元格，大范围读取分页返回
