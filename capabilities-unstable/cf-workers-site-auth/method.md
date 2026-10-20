# cf-workers-site-auth · 方法

## 1. 触发一律走后端

| 能力 | 正确 | 错误 |
| --- | --- | --- |
| GitHub 登录 | 前端只跳到本站 `/api/auth/oauth/github`，由 Worker 生成 state 再 302 到 GitHub | 前端拼 `github.com/login/oauth/authorize` 且持有 secret |
| 邮件登录 / 验证码 | 前端只 `POST` 本站发信接口，Worker 调 Resend 等 | 前端直调邮件 API（密钥暴露） |

## 2. GitHub OAuth（Workers 必踩坑）

### 必带 User-Agent

Workers 的 `fetch` **不会**自动带 `User-Agent`。GitHub REST **要求**该头，否则 `/user`、`/user/emails` 返回 403。

常见假象：`access_token` 交换成功，下一句「用户信息获取失败」。

所有发往 `github.com` / `api.github.com` 的请求统一：

```js
headers: {
  Accept: 'application/vnd.github+json',
  'User-Agent': '<your-app-name>', // 必填
  'X-GitHub-Api-Version': '2022-11-28',
  Authorization: `Bearer ${accessToken}`, // 换 token 后
}
```

### 回调 UX

- 成功：把 session 结果写入一次性 store 后 **302** 到 `/login?oauth=github&state=…`，由前端轮询取 token；不要在 callback URL 上停一页 JSON。
- 失败：同样 302 回登录页带 `error=`，避免用户对着 raw JSON。

### 演示发号

生产（已配真实 GitHub 或 `ENVIRONMENT=production`）关闭 `POST /auth/oauth` 演示发号。

## 3. 防刷分层

```text
全部 /api/*     → IP 固定窗口限流（如 120/min；health 可放宽）
鉴权写接口加严  → magic/signup/signin/oauth 启动更低配额
浏览器          → Cloudflare Turnstile（Free 通常够用）
服务端调用方    → HMAC psign（密钥只在服务端；鉴权口 Turnstile 或 psign 二选一）
```

浏览器 **不要** 塞共享 HMAC 密钥当「psign」——密钥会进 JS，假安全。

邮件除「同邮箱冷却」外必须有 **IP** 限流，否则换邮箱绕过。

## 4. Turnstile

- Dashboard 建 widget；hostname 含生产域 + 本地调试域（`localhost` / `127.0.0.1`）
- `TURNSTILE_SITE_KEY` 可公开；`TURNSTILE_SECRET_KEY` 用 `wrangler secret put`
- 未配 secret 时本地跳过，方便开发
- Invisible：真人几乎无感；用 Network 看请求是否带 `turnstile=`，或屏蔽 `challenges.cloudflare.com` 验证失败路径

## 5. psign（服务端）

```text
X-OpenUI-Ts   = 时间戳（秒或毫秒，与签名串一致）
X-OpenUI-Sign = hex(HMAC-SHA256(secret, `${ts}\n${METHOD}\n${path}\n${bodySha256}`))
```

`path` 与线上一致（如 `/auth/signin`，是否含 `/api` 前缀两边约定死）。`|now−ts|≤300s`。

## 6. 上线清单（openui-lab / wuch-ai 同类）

```bash
# D1 限流表等迁移
wrangler d1 migrations apply <db> --remote

wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put PSIGN_SECRET          # 可选
# wrangler.toml [vars]
# ENVIRONMENT = "production"
# TURNSTILE_SITE_KEY = "0x4AAAA..."

wrangler deploy
```

抽检：

```bash
curl -sS https://<host>/api/auth/turnstile/config   # enabled:true
curl -sS https://<host>/api/auth/oauth/github?next=/  # 无 token → 403
```

## 7. 与 github-authorize 的分工

| | github-authorize | cf-workers-site-auth |
| --- | --- | --- |
| 对象 | 给**已有** GitHub 集成的应用做用户授权 | 为自己的 **Workers 站点**建登录与防刷 |
| 典型 | CLI / MCP Device Flow | OAuth App 回调 + Turnstile + 限流 |
