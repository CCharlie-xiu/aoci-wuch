# 参与说明

[English](CONTRIBUTING.md) | **中文**

## 外部贡献

本仓库**不接受**外部 Pull Request，也不以公开 Issue 驱动新增能力。自动关闭的外部 PR 见 [LICENSE](LICENSE)。

若发现缺失工作流、错误边界或失效链接，可发邮件至 **1453346832@qq.com** 或 **chouxiucheng@gmail.com**。

## 维护者流程

新能力先写在私有孵化区（`capabilities-pro/`），真实场景验证后再发布：

```bash
python3 scripts/release_capability.py <name> --free|--pro --title "中文名" \
  [--title-en "English Name"] [--icon <lucide>] [--maturity S|M]
python3 scripts/validate.py
```

规则见 [`follow/`](follow/)：`write.md`、`update.md`、`promote.md`、`deprecate.md`、`update-skills.md`。

## 推送前（维护者）

```bash
python3 scripts/validate.py
```

保持 `README.md`（英文）与 `README.zh.md`（中文）能力表与 `capabilities/index.md`、`capabilities-unstable/index.md`、`index.html` 一致。发布脚本会同步这三处。

## 安全

请勿用公开 Issue 报告漏洞，见 [SECURITY.zh.md](SECURITY.zh.md)。
