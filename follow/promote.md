# promote.md

把孵化中（或历史遗留的公开待验证）能力发布为正式能力。

## 生命周期

```text
新能力
↓
私有孵化区 capabilities-pro/capabilities-unstable/   （公开处不可见）
↓
人工验证
↓
发布：选择其一
├── 免费 → capabilities/<name>/                    正文进入公开仓库（不可撤回）
└── 订阅 → capabilities-pro/capabilities/<name>/   公开索引带 [PRO]
↓
被其他项目复用
```

历史遗留在公开 `capabilities-unstable/` 的能力同样用本流程发布；转为订阅只对今后的版本生效。

## 核心规则

**AI 不得自行发布。** 发布及「免费 / 订阅」的选择必须由人确认。

这扇门的意义：孵化区不是"不成熟的代码"，而是"已提取、但尚未获得正式能力库资格"。资格与定价的判定权在人，不在 AI。

## 条件

1. 已在真实场景中被实际引用过至少一次。
2. 使用者确认无问题，并明确选择免费或订阅。
3. FRAS 完整——F、A 必填；R 可为空，但必须判断过是否存在强关系；S 可为空，但必须完成准入判断。
4. `D`（Maturity）改为 `S` 或 `M`。

## 步骤

用脚本一次完成移动目录、改成熟度、移出原索引、写入公开 `capabilities/index.md`、同步首页 `index.html` 与 `README.md`「正式能力」表：

```bash
python3 scripts/release_capability.py <name> --free|--pro --title "中文显示名" \
  [--title-en "English Name"] [--icon <lucide 图标名>] [--maturity S|M]
python3 scripts/validate.py
```

提交顺序（先私有、后公开）：

```bash
cd capabilities-pro && git add -A && git commit -m "发布 <name>" && git push && cd ..
git add -A && git commit -m "发布 <name>" && git push
```

推送后 GitHub Pages 自动重建。
