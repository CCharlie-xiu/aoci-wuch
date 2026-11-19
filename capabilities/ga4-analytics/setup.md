# setup.md · 接入契约

## 前置（用户侧）

提示用户打开：

1. https://analytics.google.com/
2. 管理 → 数据流 → Web → 复制 **衡量 ID**（`G-XXXXXXXX`）

AI 不代替登录；不确定概念时搜：  
https://developers.google.com/analytics/devguides/collection/ga4

## 环境开关（推荐）

| 变量 | 含义 | 建议 |
| --- | --- | --- |
| `VITE_APP_GA_ENABLED` | 总开关 | 测服可 `false`；正式 `true` |
| `VITE_APP_GA_DEBUG_LOG` | console + `debug_mode` | 非 prod 默认开；prod 关 |

总开关关闭时：**不注入脚本、不上报、不打 Debug console**。

## 代码模版（必用 · 跟用 G2）

| 平台 | 拷贝 | 说明 |
| --- | --- | --- |
| Web / H5 | `templates/web/` → 项目 `src/utils/ga/` | 泰国短剧文件夹模式；见该目录 README |
| Android | `templates/android/*.kt` | 彩铃双端 Firebase 启动沉淀 |
| iOS | `templates/ios/*.swift` | 同上，含 DebugView 清理 |

未拷贝模版、业务里直接 `gtag` / `logEvent` = **G2 失败**。

## 注入原则（H5，模版已实现）

1. 仅 Web 注入 `googletagmanager.com/gtag/js?id=G-…`（env 提供 ID）  
2. `send_page_view: false`；公共参数 `channel` / `batch_id` / `page_path` / `app_env`  
3. User-ID 只走 `syncGaUserId`；**禁止**进事件 params  

官方限制见 `code-map.md`；链接见 `index.md` 页面分工 A。

## 公共参数（建议每条事件都有）

按产品裁剪，名称保持稳定：

| 字段 | 说明 |
| --- | --- |
| `page_path` / `page_location` | 当前路径 |
| 渠道 / 来源相关 | 写入后不要随意改名；需进报表则登记自定义维度 |
| 业务用户标识（非官方 User-ID） | 与官方 `user_id` 分离；勿把 PII 明文写入能力库或日志规范 |
| 设备 / 网络 | 可选 |

需要进报表对比的参数 → 提示用户在 **管理 → 自定义定义** 登记。  
文档：https://support.google.com/analytics/answer/10075209

## 登录 / 登出

| 时机 | 动作 |
| --- | --- |
| 登录成功 | `set` user_id；打官方 `login`（见 `event-design.md`） |
| 注册完成 | 官方 `sign_up` |
| 登出 / 踢下线 | 清会话侧身份；`user_id` 设为 `null`，不要发空串或字符串 `"null"` |
| 游客（从未登录） | 不发 `user_id`，不要用占位符冒充 |

事件名优先官方预设；业务专有名只放业务仓字典。

## 完成后

立刻走 `verify.md` **开发**验收节，不要只说「代码已加上」。
