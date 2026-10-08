# promote.md

把待验证能力晋升为正式能力。

## 生命周期

```text
新能力
↓
capabilities-unstable/
↓
人工验证
↓
capabilities/
↓
被其他项目复用
```

本文件规定最后一步的晋升条件。

## 核心规则

**AI 不得自行晋升。** 晋升必须由人确认。

这扇门的意义：`unstable` 不是"不成熟的代码"，而是"已提取、但尚未获得正式能力库资格"。资格的判定权在人，不在 AI。

## 条件

1. 已在真实场景中被实际引用过至少一次。
2. 使用者确认无问题。
3. FRAS 完整——F、A 必填；R 可为空，但必须判断过是否存在强关系；S 可为空，但必须完成准入判断。
4. `D`（Maturity）改为 `S` 或 `M`。

## 步骤

1. 移动目录：`capabilities-unstable/<name>/` → `capabilities/<name>/`。
2. 从 `capabilities-unstable/index.md` 删除该行。
3. 把该行加入 `capabilities/index.md`，`D` 位从 `E`/`D` 改为 `S`/`M`。

订阅能力（`[PRO]`）同理，只是第 1 步在私有仓库内移动：`capabilities-pro/capabilities-unstable/<name>/` → `capabilities-pro/capabilities/<name>/`；索引行保留 `[PRO]`。两个仓库分别提交，先推私有仓库。
