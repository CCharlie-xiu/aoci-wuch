# write.md

往仓库新增一个能力。

## 规则

- 一律先写入 `capabilities-unstable/`，**禁止直接写入 `capabilities/`**。
- 目录 = 能力边界。目录里放什么由能力本身决定，不要求必须有可运行代码。
- 新写入时 `D`（Maturity）只能是 `E` 或 `D`。
- 只收录会在别处再次用到的东西。

## 步骤

1. 建目录 `capabilities-unstable/<name>/`，name 用小写连字符。
2. 写 `index.md`：按 `_meta/taxonomy.md` 的 FRAS 写 F / R / A / S。
3. 放入资产：脚本、工作流、示例、配置——有就放，没有就不放。
4. 在 `capabilities-unstable/index.md` 追加一行：`name[tag]: 一句话核心职责`。

步骤 1、2、4 可用脚本一次完成：

```bash
python3 scripts/new_capability.py <name> --tag <tag> --desc "一句话核心职责"
```

## 订阅能力（[PRO]）

订阅能力的正文放在私有仓库 `aoci-wuch-pro`，本地固定 clone 在 `capabilities-pro/`（已被 `.gitignore` 排除）。索引行仍写在公开 `index.md`，带 `[PRO]`：

```text
name[tag][PRO]: 一句话核心职责
```

- 新建：`python3 scripts/new_capability.py <name> --tag <tag> --desc "..." --pro`，正文写入 `capabilities-pro/capabilities-unstable/<name>/`。
- **禁止**把订阅正文放进公开目录；`scripts/validate.py` 会拦截。
- 提交顺序：先在 `capabilities-pro/` 内提交并推送私有仓库，再提交并推送公开索引。
- 本机缺少 `capabilities-pro/` 时先 clone：`git clone https://github.com/CCharlie-xiu/aoci-wuch-pro.git capabilities-pro`。
- 已公开过的能力改为订阅时，旧版本仍留在公开 git 历史中；只把新版本放入私有仓库。

## 完成标准

目录可独立看懂；FRAS 符合 taxonomy；索引行已追加；`python3 scripts/validate.py` 通过。
