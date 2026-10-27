# code-map.md · 代码与平台对账

目标：代码里的事件名、DebugView 里的事件名、事件列表里的事件名，三处一致。

业务字典留在业务仓，本文件只给方法与格式。

## 1. 先判定接入方式

在项目根目录搜索：

```bash
rg -n "googletagmanager.com/gtag/js|gtag\(|dataLayer\.push|GTM-|G-[A-Z0-9]{6,}" --glob '!node_modules' --glob '!dist'
rg -n "trackGaEvent|gtag\('event'|gtag\('set'|gtag\('config'|user_id" --glob '!node_modules' --glob '!dist'
```

| 命中 | 方式 | 事件在哪改 |
| --- | --- | --- |
| `gtag/js?id=G-` + `gtag('event'` | 直接 gtag | 业务代码 |
| `GTM-` + `dataLayer.push` | GTM | 代码只推数据；事件在 GTM 容器配置 |
| 两者都有 | 混用 | 逐事件确认由哪一侧发，防止双发 |
| 有封装（如 `trackGaEvent`） | 封装层 | 在封装函数里看公共参数与开关 |

GTM 界面步骤本能力未收录，走 `gap-protocol.md`。

## 2. 官方 gtag 写法（核对 2026-10-27）

| 项 | 规则 |
| --- | --- |
| 发事件 | `gtag('event', '<event_name>', { <params> })` |
| 位置 | 必须在 Google tag 代码片段**之后**；之前的事件不会被处理 |
| 登录 | `gtag('set', { user_id })`，再发 `login` |
| 登出 | `gtag('set', { user_id: null })`；不要发 `""`、空格、字符串 `"null"` |
| 从未登录 | 不发 user_id |
| 禁止 | user_id 放进 `user_properties`、事件参数、自定义维度 |

来源：https://developers.google.com/analytics/devguides/collection/ga4/events 、https://developers.google.com/analytics/devguides/collection/ga4/user-id

## 3. 事件字典格式（放业务仓）

| 事件名 | 官方/自定义 | 触发时机 | 代码位置 | 参数 key | 已登记自定义维度 | 控制台位置 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| login | 官方 | 登录成功 | `<文件:行>` | method | 否 | 互动度 → 事件 | 已验 |

规则：

- 一事件一行。同义事件只保留一个名字。
- 状态取值：`待埋` / `已埋未验` / `DebugView 已验` / `事件列表已见`。
- 不写真实用户标识、Measurement ID。

## 4. 对账三步

```text
1 代码清单    用第 1 节命令列出所有事件名 → 填字典
2 DebugView   管理 → 数据展示 → DebugView，逐个触发 → 核对事件名与参数
3 事件列表    报告 → 互动度 → 事件 → 核对名字与数量（新事件可能晚几小时）
```

DebugView 需启用 debug mode：个人设备用 Tag Assistant；全部设备改配置。启用后注意过滤开发者流量，避免污染报表。来源：https://support.google.com/analytics/answer/7201382

## 5. 差异归类

| 现象 | 常见原因 | 动作 |
| --- | --- | --- |
| 代码有，后台无 | 开关关闭；事件在 snippet 之前；调用点没走到；广告拦截；未同意 consent | `method.md` 排障 |
| 后台有，代码无 | 增强型衡量自动事件；GTM 侧发出；旧版本遗留 | 查增强型衡量、GTM 容器 |
| 名字不同 | 大小写、官方名 vs 自定义名、旧名 | 统一一个名字，关掉双发 |
| 事件有，参数在报表看不到 | 参数未登记自定义维度 | `analysis.md` 自定义维度 |
| DebugView 空 | 未启用 debug mode；隐私控制或 consent 未同意时事件不显示 | `verify.md` |

## 6. 向开发索取

发 `roles-qa.md` 模版 E。
