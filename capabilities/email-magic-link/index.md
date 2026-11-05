# email-magic-link

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`email-magic-link[KA8SH]`

F: 用一次性邮件链接完成无密码登录与建号
R:
A: 契约面：`POST /auth/magic/request`（发信）、`GET /auth/magic/verify?token=`（确认登录）；库表只存 token 的 SHA-256；发信走 Resend（或同类）运行时 key；本地可回传 link 不发信
S: 链接打开不得自动登录（防企业邮箱预取扫描器消费一次性 token）；须用户再点「确认登录」；token 只存哈希、短 TTL、一次性；同邮箱限流（如 60s 冷却、每小时上限）；对外一律回「已发送」不泄露是否注册；发件域名须 SPF/DKIM 验证后才能用自有 From

---

## 这是什么

无密码登录：用户填邮箱 → 服务端生成随机 token → **只存哈希** → 邮件里带明文链接 → 用户打开后**手动确认** → 校验未用未过期 → 建号或复用 → 发会话。

发信侧以 [Resend](https://resend.com) 为已验证路径（域名 DNS + sending key）；换供应商时保持同一安全模型即可。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 邮件登录 / 魔法链接 / 无密码登录 | 命中 |
| 接 Resend 发登录信 | 命中（本能力含发信配置要点） |
| 只要营销邮件 / Newsletter | 不命中 |
| 只要重置密码邮件 | 可借鉴限流与哈希，但验收标准不同 |

## 怎么用

### 总流程

```text
1. 库表 auth_magic_token：token_hash, email, next, created_at, expires_at, used_at
2. request：校验邮箱 → 限流 → 生成 raw token → 存 sha256(raw)
   → 拼 {origin}/login?magic={raw} → 发信（本地可把 link 回前端）
3. 邮件页 / 登录页带 magic= 时：展示「确认登录」，不要在 onLoad 调 verify
4. 用户点击确认 → verify：查哈希 → 拒复用/过期 → 标 used_at
   → 按 email 取号或建号 → 发产品会话
5. 发信：域名在 Resend 验证；Worker secret 放 RESEND_API_KEY；
   可选 MAGIC_FROM="品牌 <login@你的域>"
```

### Resend（发信）最小集

1. 注册 Resend → Add Domain（建议用已有站点域或 `mail.` 子域）。
2. DNS：DKIM TXT、`send` 的 MX/TXT（SPF）、以及文档要求的 CNAME；无 DMARC 时加 `v=DMARC1; p=none;`。
3. Verify 通过后，建 **sending_access**、限制该域的 API Key → 写入运行时 secret（不必重新部署即可生效的平台优先）。
4. From 不必是真实收件邮箱，但必须在已验证域下。

### 前端要点

- 「用邮件链接登录」与密码模式切换；发送成功提示 + 重发倒计时（对齐服务端冷却）。
- 确认页与表单互斥；`[hidden]` 勿被 `display:flex` 盖掉。
- 本地：无 key 时返回 link，点开即可端到端验「建号 → 二次使用被拒」。

### 验收

- 首次：建号并进入产品；再次：同邮箱复用。
- 同一 raw token 第二次 verify 失败。
- 冷却内重复 request → 429。
- 邮件链接打开后未点确认前，会话未建立（可用预取/无头请求探测）。
- 线上未配 key → 明确「邮件服务未配置」，其它登录方式仍可用。

## 最不能违反什么

- **禁止打开链接即自动 verify**（扫描器会偷登/废链）。
- **库中永不存明文 token**，只存哈希。
- **不在响应里区分「邮箱未注册」**（防枚举）。
- **sending key 与完整账号 key 分离**；完整 key 不进应用。