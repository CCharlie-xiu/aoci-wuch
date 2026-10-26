# 至关重要 · AOCI-Wuch

[English](README.md) | **中文**

[![站点](https://img.shields.io/badge/site-skill.wuch--ai.net-545f2a?style=flat-square)](https://skill.wuch-ai.net/)
[![订阅](https://img.shields.io/badge/subscribe-auth.html-646b75?style=flat-square)](https://skill.wuch-ai.net/auth.html)
[![许可](https://img.shields.io/badge/license-All%20Rights%20Reserved-lightgrey?style=flat-square)](LICENSE)

**一个可复用的 AI Agent 能力库。**

为 AI 编码助手提供整理过的工作方法、流程与工具接入指南：先按任务查索引，再只读取命中的说明。

**主页 → [https://skill.wuch-ai.net](https://skill.wuch-ai.net/)** · [订阅授权](https://skill.wuch-ai.net/auth.html) · [正式索引](capabilities/index.md) · [待验证索引](capabilities-unstable/index.md)

## 为什么用这个库

| 你得到的 | 含义 |
| --- | --- |
| 任务 → 索引 → 单能力 | 不必在对话开始时装入全部正文 |
| 正式 / 待验证 | 成熟度可见；待验证不会被当成已验证 |
| 免费 + PRO | 公开能力在 GitHub；订阅能力走 [授权页](https://skill.wuch-ai.net/auth.html) |
| 适配 Cursor 等 | 将仓库装为 Agent Skill，按 `SKILL.md` 使用 |

## 安装

将仓库安装为当前 AI 助手可复用的 Agent Skill：

```text
https://github.com/CCharlie-xiu/aoci-wuch.git
```

也可以直接告诉 AI：

```text
请将 https://github.com/CCharlie-xiu/aoci-wuch.git 安装为当前 AI 助手可复用的 Agent Skill。
```

## 使用方式

```text
用户任务 → 阅读能力索引 → 选择匹配能力 → 按需读取说明 → 执行任务
```

本库不会要求 AI 在每次对话开始时载入全部能力正文。先读 [capabilities/index.md](capabilities/index.md)（必要时再读待验证索引），只打开命中项。

## 能力目录

### 正式能力

| 能力 | 用途 |
| --- | --- |
| [GitHub 应用授权](capabilities/github-authorize/) | 为指定 GitHub 应用完成授权流程 |
| [原生移动应用搭建](https://skill.wuch-ai.net/auth.html) `PRO` | 使用 mobile-template 家族创建并维护原生双端 App（订阅能力，含 Figma/机型观感实践） <!-- pro:mobile-template-app --> |
| [复杂设计逻辑枚举](capabilities/logic-space-enumeration/) | 推演复杂设计中的有效场景、路径与结果 |
| [Excel 后端选择配置](capabilities/excel-capability/) | 处理 Excel 时在文件级与桌面级后端间选择并打通，默认文件级、必要时升级桌面级 |
| [iOS 上架与 TestFlight](https://skill.wuch-ai.net/auth.html) `PRO` | 把 iOS App 从 Xcode 项目发布到 TestFlight 与 App Store（订阅能力） <!-- pro:ios-app-store-release --> |
| [DBX 数据库接入](capabilities/dbx-mcp-setup/) | 需要看数据库时发现并打通 DBX MCP 环境，完成安装配置并验证可用 |
| [视频画面抽帧](capabilities/video-frame-extract/) | 按自然语言要求从视频中提取画面并生成有序图片集合 |
| [设计风格 Canvas](capabilities/wuch-design-canvas/) | 按 wuch-ai 设计锚点询问用户所需效果，确认后产出设计风格 Canvas |
| [UI 风格提示设计](https://skill.wuch-ai.net/auth.html) `PRO` | 让 AI 先确认风格再直出可运行的界面设计（订阅能力） <!-- pro:ui-design-prompt --> |
| [轻量 SSO 登录中心](https://skill.wuch-ai.net/auth.html) `PRO` | 在自有应用间落地轻量 SSO 登录中心：授权码 + PKCE，一次登录多应用可用、令牌不跨界（订阅能力） <!-- pro:sso-login-center --> |

### 待验证能力

| 能力 | 用途 |
| --- | --- |
| [LibTV 影像接入](capabilities-unstable/libtv-mcp-setup/) | 接入并验证 LibTV Remote MCP |
| [Workers 站点登录防刷](capabilities-unstable/cf-workers-site-auth/) | Cloudflare Workers 上落地 GitHub OAuth / 邮件登录与限流防刷 |

## 仓库内容

```text
SKILL.md                 AI skill 入口（安装后优先阅读）
capabilities/            正式能力
capabilities-unstable/   待验证能力
capabilities-retired/    退役能力，仅供追溯
follow/                  写入、更新、晋升与退役规则
scripts/                 校验、发布与源仓库更新脚本
index.html · auth.html   项目主页（GitHub Pages → skill.wuch-ai.net）
```

## 本地校验

```bash
python3 scripts/validate.py
```

## 更新能力库源仓库

此流程只把 GitHub `main` 安全快进到当前源仓库，**不**更新任何 AI 产品中已安装的副本：

```bash
python3 scripts/update_skills.py check
python3 scripts/update_skills.py apply \
  --expected-local <检查时的本地 commit> \
  --expected-remote <检查时的远程 commit> \
  --confirm
```

详见 [`follow/update-skills.md`](follow/update-skills.md)。

## 链接

- 主页：[https://skill.wuch-ai.net](https://skill.wuch-ai.net/)
- 订阅授权：[https://skill.wuch-ai.net/auth.html](https://skill.wuch-ai.net/auth.html)
- 仓库：[https://github.com/CCharlie-xiu/aoci-wuch](https://github.com/CCharlie-xiu/aoci-wuch)
- 相关产品：[wuch-ai](https://github.com/CCharlie-xiu/wuch-ai) · [https://wuch-ai.net](https://wuch-ai.net)
- 参与说明：[CONTRIBUTING.zh.md](CONTRIBUTING.zh.md)
- 安全：[SECURITY.zh.md](SECURITY.zh.md)
- 联系：[1453346832@qq.com](mailto:1453346832@qq.com) · [chouxiucheng@gmail.com](mailto:chouxiucheng@gmail.com)
- 许可：[LICENSE](LICENSE)

## 许可

保留所有权利，仅供查看与个人自用；禁止修改后再分发；不接受外部贡献。详见 [LICENSE](LICENSE)。
