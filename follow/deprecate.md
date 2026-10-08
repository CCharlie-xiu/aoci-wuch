# deprecate.md

退役过时、重复或被替代的能力。

## 规则

- 移入 `capabilities-retired/<name>/`，不删除资产。
- 从原索引移除，并在退役索引记录原标签和原因。
- 在能力文件注明日期、原因和替代项（如有）。
- 默认不复用；恢复时按新能力重新验证。

## 步骤

1. 检查替代项和依赖。
2. 移动目录，更新原索引、退役索引及相关链接。
3. 从首页 `index.html` 的 `capabilities` 列表和 `README.md` 能力目录中移除该能力；运行 `scripts/validate.py` 确认三处一致。
