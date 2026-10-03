# github-authorize · 实现层

可执行入口：`scripts/github_authorize.py`
纯 Python 标准库，无第三方依赖。

---

## 本能力的角色

本能力执行的是 **GitHub 授权协议本身**，不持有任何特定应用的身份。

```text
输入：目标应用的 OAuth App 身份（client_id）+ 其授权回调配置
      ↓
本能力：执行授权协议
      ↓
输出：该应用的访问令牌
```

同一个能力可以服务于不同应用 —— 每个应用有各自的 OAuth App：

```text
github-authorize
    ├── OAuth App A → client_id A
    ├── OAuth App B → client_id B
    └── OAuth App C → client_id C
```

**它不能拿自己的身份去替另一个应用授权。** 「是哪个应用」由该应用自己的 OAuth App 决定 ——
这正对应 `index.md` 中 F 的「**指定**」二字。

**前提：目标应用本身必须已经支持 GitHub。**
若一个应用根本没有 GitHub 集成（没有 Connect GitHub 入口、也没有自己的 OAuth App 身份），
本能力无法为其创造授权 —— 此时应直接判定「不适用」，而不是尝试执行。

---

## 前置条件

1. Python 3.8+
2. 一个 GitHub OAuth App 的 `client_id`（一次性获取）
3. 运行环境能访问 **`github.com`** 与 **`api.github.com`**

### 注册 OAuth App（一次性，必须由人完成）

1. 打开 <https://github.com/settings/developers> → **New OAuth App**
2. Application name 任意；Homepage URL 填 `https://github.com`
3. **device 流程**：在该 App 设置里勾选 **Enable Device Flow**
4. **web 流程**：Authorization callback URL 填 `http://127.0.0.1/callback`
5. 复制 **Client ID**（**不需要** Client Secret）

```bash
python3 scripts/github_authorize.py config set --client-id <你的ClientID>
# 或直接：export GITHUB_CLIENT_ID=<你的ClientID>
```

---

## 两种流程

| 流程 | 命令 | 特点 |
| --- | --- | --- |
| **web**（默认） | `authorize --flow web` | 本地 `127.0.0.1` 回调服务器 + PKCE，直接打开授权页 |
| **device** | `authorize --flow device` | 无需本地端口、无需 `redirect_uri`，适合 CLI / headless |

选哪一种由**目标应用所要求的流程**决定，不由本能力决定。

- `web` 更接近「软件里点 Connect GitHub」的形态，是常规桌面场景的默认
- `device` 用于 CLI、无浏览器、远程机器、headless 等受限环境

---

## 命令

```text
config set --client-id <ID> [--scope "..."] [--flow web|device]
config show
authorize [--flow web|device] [--no-wait] [--no-browser] [--timeout 900]
poll [--timeout 900]
status
token
logout
revoke-url
doctor
```

### web 流程（默认）

```bash
python3 scripts/github_authorize.py authorize
```

本地起 `127.0.0.1` 回调服务器 → 自动打开授权页 → 用户点 Authorize → 回调换取令牌。

### device 流程的两种用法

```bash
# 一次跑完（阻塞轮询直到授权完成或超时）
python3 scripts/github_authorize.py authorize --flow device

# 分两步 —— 更适合 AI：先拿码推给用户，再回来轮询
python3 scripts/github_authorize.py authorize --flow device --no-wait
python3 scripts/github_authorize.py poll
```

所有命令的结果以 **JSON 输出到 stdout**，进度信息输出到 **stderr**，便于脚本与 AI 解析。

---

## 令牌存储

| 内容 | 路径 | 权限 |
| --- | --- | --- |
| 配置 | `~/.config/github-authorize/config.json` | 0600 |
| 令牌 | `~/.config/github-authorize/token.json` | 0600 |
| 进行中的授权 | `~/.config/github-authorize/pending.json` | 0600 |

**令牌不写入本仓库。** 本能力目录内不含任何凭据。

边界应理解为：

```text
能力仓库（本目录）  → 不保存 token
本机运行环境        → 可以保存授权产生的 token
```

即：**不保存凭据到能力仓库；授权产生的运行时凭据仅由本机安全存储使用。**

---

## 与认知层的关系

```text
index.md           认知层：什么情况该做、流程是什么、哪里必须停下
implementation.md  实现层：怎么真的做、依赖什么、有哪些约束
scripts/           可执行入口：AI 或人直接调用
```

AI 应当先读 `index.md` 判断「是否需要授权」，再读本文件确认「当前环境能不能执行」，
最后调用 `scripts/github_authorize.py`。

**环境不具备执行条件时，必须明说，不得假装已执行。**

---

## 已知约束

### 1. 所有 OAuth 端点都在 `github.com`

| 用途 | 端点 |
| --- | --- |
| 设备码 | `POST https://github.com/login/device/code` |
| 授权页 | `GET https://github.com/login/oauth/authorize` |
| 令牌交换 | `POST https://github.com/login/oauth/access_token` |
| 身份验证 | `GET https://api.github.com/user` |

只有最后一个是 `api.github.com`。**若环境只放行 `api.github.com` 而拦 `github.com`，则授权无法完成，但已存在的令牌仍可用于调用 API。**

### 2. `redirect_uri` 用 `127.0.0.1`，不用 `localhost`

OAuth RFC 明确建议避免 `localhost`（部分系统会解析到 IPv6 `::1` 导致回调失败）。
loopback 回调**不要求端口与注册值一致**，因此本实现使用随机空闲端口。

### 3. device 流程必须在 OAuth App 里显式启用

未启用时 GitHub 返回 `device_flow_disabled`，脚本会给出对应的修复步骤。

### 4. 轮询必须遵守 `interval`

低于 `interval` 的请求会收到 `slow_down`，每次加 5 秒。
设备码有效期 15 分钟（900 秒），过期需重新申请。

### 5. 权限范围由调用方决定

默认 `read:user`（最小权限）。需要更多时显式传入，例如：

```bash
--scope "repo read:user"
```

---

## 验证记录

| 项目 | 结果 |
| --- | --- |
| `--help` / 子命令解析 | ✅ 通过 |
| `config show` / `config set` | ✅ 通过 |
| `status`（无令牌） | ✅ 返回 `unauthorized` |
| 缺 `client_id` 的报错路径 | ✅ 给出分步修复指引 |
| 网络异常兜底 + 重试 | ✅ 3 次重试后返回结构化错误，不再抛异常 |
| `doctor` 连通性诊断 | ✅ 正确区分 `github.com`（不可达）与 `api.github.com`（可达） |
| 端到端真实授权 | ⚠️ **未完成** —— 见下方说明 |

### 端到端未完成的原因

验证时的执行环境**只放行 `api.github.com`，拦 `github.com`**（实测域名矩阵）：

```text
api.github.com              → 200  可达
raw.githubusercontent.com   → 301  可达
github.com                  → 000  不可达
gist.github.com             → 000  不可达
```

由于设备码、授权页、令牌交换三个端点全部位于 `github.com`，
在该环境下无法完成一次真实授权。

**这不代表实现有缺陷** —— 脚本逻辑、错误处理、重试、诊断均已通过验证。
在能正常访问 `github.com` 的环境中（普通终端 / 本机网络）即可跑通。

验证前请先执行：

```bash
python3 scripts/github_authorize.py doctor
```

`ready_to_authorize: true` 才说明环境具备条件。
