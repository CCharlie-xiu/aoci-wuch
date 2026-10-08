# write.md

往仓库新增一个能力。

## 规则

- **新能力一律写入私有孵化区** `capabilities-pro/capabilities-unstable/`（私有仓库 `aoci-wuch-pro`，本地 clone 已被公开仓库 `.gitignore` 排除）。
- **禁止**写入公开的 `capabilities-unstable/` 或 `capabilities/`。公开 `capabilities-unstable/` 只保留历史遗留的已公开能力，不再新增。
- 孵化中的能力**完全不公开**：不进公开索引、不进首页 `index.html`、不进 `README.md`，只登记在私有索引 `capabilities-pro/capabilities-unstable/index.md`，且不标 `[PRO]`。
- 免费还是订阅**在发布时决定**（见 `promote.md`），孵化阶段不需要决定。
- 目录 = 能力边界。目录里放什么由能力本身决定，不要求必须有可运行代码。
- 新写入时 `D`（Maturity）只能是 `E` 或 `D`。
- 只收录会在别处再次用到的东西。

## 为什么

公开仓库的 git 历史永久可追溯，写进公开目录的内容事后无法真正收回。先在私有区孵化，验证通过后再选择公开或订阅：从私有转公开随时可以，从公开转私有不可逆。

## 步骤

1. 本机缺少私有 clone 时先执行：`git clone https://github.com/CCharlie-xiu/aoci-wuch-pro.git capabilities-pro`。
2. 新建（建目录、写 FRAS 模板、登记私有索引）：

   ```bash
   python3 scripts/new_capability.py <name> --tag <tag> --desc "一句话核心职责"
   ```

3. 写 `index.md`：按 `_meta/taxonomy.md` 的 FRAS 写 F / R / A / S。
4. 放入资产：脚本、工作流、示例、配置——有就放，没有就不放。
5. 校验并只提交私有仓库：

   ```bash
   python3 scripts/validate.py
   cd capabilities-pro && git add capabilities-unstable && git commit -m "孵化 <name>" && git push
   ```

## 完成标准

目录可独立看懂；FRAS 符合 taxonomy；已登记私有索引；`python3 scripts/validate.py` 通过；公开仓库没有任何改动。
