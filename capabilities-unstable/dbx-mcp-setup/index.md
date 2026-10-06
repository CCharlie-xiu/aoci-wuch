# dbx-mcp-setup

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`dbx-mcp-setup[TI8DH]`

F: 当需要通过数据库工具查看数据时，发现 DBX / DBX MCP / 当前 AI 客户端三处状态，完成必要的安装与配置并验证可用
R:
A: `scripts/check.py`（只读三态检测，输出状态与下一步）；`scripts/install.py`（调用官方安装命令，需 `--confirm`）；`scripts/validate.py`（可用性验证）；`method.md`（状态机、客户端配置位置、唤起方式）
S: DBX 已装 ≠ MCP 已装 ≠ 当前客户端已加载，三者必须分别检查；GUI 客户端不一定继承 shell PATH，配置必须写展开后的绝对路径，不能写 `~` 或裸 `dbx-mcp`；工具名全部带 `dbx_` 前缀；`dbx_open_table` / `dbx_execute_and_show` 要求 DBX 桌面端正在运行；权限以 DBX 设置 → MCP 的中央策略为准，环境变量无法放宽；不猜密码、不执行写操作、不动已有无关 MCP 配置；执行远端安装脚本前必须取得用户确认

---

## 这是什么

环境接入能力：让 AI 在「需要看数据库」时，自己把 DBX MCP 这条通路打通并验证可用。

它**不实现** DBX MCP，也不重新实现 DBX 的安装逻辑——只做发现、检查、编排官方安装、验证、交付。真正的查询由 DBX MCP 工具完成。

## 什么时候用

用户需要看数据库，而当前环境没有可用 DBX MCP 时触发：

| 用户说 | 判定 |
| --- | --- |
| 看一下 users 表有多少数据 | 数据库读取需求 |
| 查一下这个库有哪些表 | 数据库读取需求 |
| 看下 local 连接的 Schema | 数据库读取需求 |
| 帮我打开 orders 表 | 数据库读取 + 唤起需求 |

已有可用的 DBX MCP 时**不要**触发本能力，直接调用 MCP 工具。

## 使用入口

```text
python3 scripts/check.py      # 只读：三态 + 状态机位置 + 下一步 + 配置片段
python3 scripts/install.py --confirm [--channel native|brew|npm] [--cli]
python3 scripts/validate.py [--client NAME]
```

状态机（`check.py` 的 `state` 字段）：

| 状态 | 含义 | 下一步 |
| --- | --- | --- |
| `READY` | MCP 已装且客户端已配 | 直接用 MCP 工具 |
| `MCP_NOT_CONFIGURED` | MCP 已装，客户端没配 | 写入 `mcpServers.dbx` |
| `MCP_MISSING` | DBX 在，MCP 没装 | 执行官方安装命令 |
| `DBX_MISSING` | DBX 本体都没有 | 引导安装 DBX，再装 MCP |

官方安装命令（`install.py` 内部使用，不要手写变体）：

```text
原生（推荐）  curl -fsSL https://dbxio.com/install-mcp | sh
Homebrew     brew install t8y2/tap/dbx-mcp
npm          npm install -g @dbx-app/mcp-server
DBX CLI      npm install -g @dbx-app/cli     /  brew install dbx-cli
```

## 最终交付

输出四件事，缺一不可：

| 输出 | 内容 |
| --- | --- |
| 当前状态 | DBX / MCP / 客户端各自是什么情况 |
| 已执行动作 | 装了什么、改了哪个配置文件 |
| 需用户完成的动作 | 重启客户端、在 DBX 设置 → MCP 授权连接/工具、信任新 MCP |
| 下一步怎么用 | 一句可直接照说的话术 |

话术见 `method.md` 末尾。

## 边界

```text
AI 可以：检查 / 判断 / 执行官方安装 / 检查配置 / 只新增 dbx 键 / 验证 / 告诉用户怎么用
AI 不得：猜数据库密码与连接信息 / 改或删无关 MCP / 自动执行 INSERT UPDATE DELETE DDL /
         放宽权限环境变量 / 代替用户做系统级授权确认
```

触发原因是「看数据」，不等于获得写权限。默认只读。
