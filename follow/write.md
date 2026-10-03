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

## 完成标准

目录可独立看懂；FRAS 符合 taxonomy；索引行已追加。
