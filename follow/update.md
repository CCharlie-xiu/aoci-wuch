# update.md

修改一个已存在的能力。

## 规则

- 改了 F 或标签 → 必须同步改索引行。只改 R / A / S 不必动索引。
- 正式能力（`capabilities/`）发生**重大语义变更** → 退回 `capabilities-unstable/` 重新验证。
- 不得删除 S。S 过时了就改写，不删——删掉等于声称"这里没有坑"。

## 步骤

1. 从 `capabilities/index.md` 或 `capabilities-unstable/index.md` 定位。
2. 打开 `capabilities[-unstable]/<name>/` 修改内容。
3. 若 F 或 tag 变化，同步对应 index.md 的那一行。
4. 若退回 unstable，把索引行一并移到 `capabilities-unstable/index.md`。
