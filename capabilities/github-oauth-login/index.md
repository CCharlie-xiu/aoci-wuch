# github-oauth-login

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`github-oauth-login[KA8SH]`

F: 把 GitHub OAuth 接到自有产品的登录与建号链路
R: github-authorize
A: 契约面：`GET /auth/oauth/github/config`（是否启用）、`GET /auth/oauth/github?next=`（发起）、`GET /auth/oauth/github/callback`（换票建号）、前端轮询/取会话；密钥只走运行时 secret（如 `GITHUB_CLIENT_ID` / `GITHUB_SECRET`）
S: 与 `github-authorize` 不同——本能力是「用户用 GitHub 登录你的产品」，不是「为某应用授权访问 GitHub」；client_secret 永不进前端与仓库；state 必须服务端一次性消费；整页跳转后用户取消/后退要用 `pageshow`/bfcache 清掉加载态；本地未配凭据时应有 demo 回落，不能假装已接真 OAuth

---

## 这是什么

已在 Cloudflare Workers + 自有登录页跑通的 **产品侧 GitHub 登录**：注册 GitHub OAuth App → 服务端 state → 302 授权 → callback 换 token → 建/复用账号 → 发会话 → 前端落地。

核心可复用点：安全边界、账号合并策略、前后端职责拆分、未配置时的降级，而不是某一框架的样板代码。

## 与 github-authorize 的区分

| | github-oauth-login（本能力） | github-authorize |
| --- | --- | --- |
| 谁登录 | 终端用户登录**你的产品** | 用户授权**某个 GitHub 应用/CLI/MCP** |
| 产物 | 产品会话 token / 账号行 | 应用侧 GitHub access |
| 身份谁持有 | 你的 OAuth App（client_id/secret） | 目标应用自己的身份 |

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 网站/App 要「用 GitHub 登录」 | 命中 |
| 接 GitHub OAuth、Callback、建号 | 命中 |
| 桌面软件 / CLI 要访问 GitHub API | 不命中 → `github-authorize` |
| 只改登录按钮样式 | 不命中 |

## 怎么用

### 总流程

```text
1. GitHub → Settings → Developer settings → OAuth Apps → New
   Homepage / Authorization callback URL 填生产根与
   {origin}/api/auth/oauth/github/callback（路径按项目约定）
2. 拿到 Client ID；生成 Client secret
3. 写入运行时 secret（Workers：wrangler secret put；禁止进 git）
4. 服务端：state 落库 → 302 authorize（scope 建议 read:user user:email）
5. callback：校验 state → 换 access_token → 拉 /user + /user/emails
6. 按 github_login 复用账号；邮箱已存在则绑定双登录，勿造第二账号
7. 发产品会话；前端存 token 后跳 next
8. 登录页：探测 config.enabled；未启用走本地 demo，勿硬跳 GitHub
```

### 前端要点

- 真 OAuth：`showLoading` → `location.assign` 整页跳；**不要用弹窗假设**。
- 用户关授权页 / 浏览器后退：监听 `pageshow`（含 bfcache），清遮罩与按钮 loading。
- 回调落地页轮询「一次性会话」时设截止时间；失败要可重试并提示。

### 验收

- 首次授权：新建 `provider=github` 账号并进入产品。
- 再次授权：同一 `github_login` 复用，不双开号。
- 同邮箱已用密码注册：绑定后两种方式都能进同一账号。
- 未配 secret：接口返回未启用；前端仍可用其它登录方式。
- 取消授权后回登录页：不卡在「正在跳转 GitHub…」。

## 最不能违反什么

- **Secret 只在服务端 secret 存储**，不进前端包、不进能力库、不进聊天。
- **state 一次性、带 TTL**；callback 先删/消费再换票，防重放。
- **不要把 GitHub access_token 当产品会话**长期存前端；只换自己的 session。