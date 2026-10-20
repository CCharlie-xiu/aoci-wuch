# cf-workers-site-auth

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

cf-workers-site-auth[KA8DH]

F: 在 Cloudflare Workers 上为站点落地安全可用的登录与防刷（GitHub OAuth / 邮件 / 限流）
R: github-authorize
A: checklist、pitfalls、deploy-secrets
S: Workers 调 GitHub API 必须自带 User-Agent，否则换 token 成功也会在 /user 上 403；浏览器不可嵌入 psign 密钥

---

## 适用场景

自建站点跑在 **Cloudflare Workers + D1**（或同类边缘运行时），需要：

- GitHub OAuth 登录（站点自己的 OAuth App）
- 邮箱魔法链接 / 验证码类发信
- 防刷：IP 限流 + Turnstile + 可选服务端 psign

**不是**「给某个 CLI/MCP 做 GitHub 授权」——那是 `github-authorize`。本能力是「**自己的产品登录链路**」。

## 判断条件

出现下列之一即适用：

- Workers 上 GitHub 回调报「用户信息获取失败」/ 403
- 登录、发信、OAuth 启动可能被刷
- 纠结 GitHub / 邮件该前端直调还是后端触发

## 执行入口

先读本目录 `method.md`，按清单核对；部署密钥与域名按其中「上线」节。

## 验证方式

- 不带 Turnstile token 调鉴权写接口 → 403（已配密钥时）
- GitHub 回调成功 → 302 到 `/login?oauth=github&state=…`，前端能换到 session
- 裸 `curl` 打 `api.github.com/user` 无 UA 会失败；Worker 内带 UA 后通过

## 边界

- 不代替注册 GitHub OAuth App / Turnstile widget（需人在 Dashboard 完成）
- 不把 `PSIGN_SECRET` / `TURNSTILE_SECRET_KEY` / `GITHUB_SECRET` 写入前端或能力仓库
- Turnstile Free 档对绝大多数站点足够；Invisible 模式对真人几乎无感，不等于没校验
