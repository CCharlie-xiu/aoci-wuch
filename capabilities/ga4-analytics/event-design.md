# event-design.md · 事件契约（官方 vs 自定义）

目标：先分清「平台自带 / 官方推荐」与「自己定义」；业务名只写在业务仓，本能力只定**预设边界与命名契约**。

核对事件名与参数时优先读：

| 用途 | URL |
| --- | --- |
| 推荐事件总表 | https://developers.google.com/analytics/devguides/collection/ga4/reference/events |
| 手动发事件（gtag） | https://developers.google.com/analytics/devguides/collection/ga4/events |
| 自动收集事件 | https://support.google.com/analytics/answer/9234069 |
| 增强型衡量 | https://support.google.com/analytics/answer/9216061 |
| 电商事件 | https://developers.google.com/analytics/devguides/collection/ga4/ecommerce |
| 自定义事件说明 | https://support.google.com/analytics/answer/12229021 |

---

## 两类事件（必先分清）

| 类型 | 是什么 | 谁定义名字 | 例子 |
| --- | --- | --- | --- |
| **A. 平台自带 / 官方推荐** | GA4 已认识或强烈建议使用的事件 | Google | `page_view`、`session_start`、`login`、`purchase` |
| **B. 自定义事件** | 业务自己发明的名字 | 你的产品 | `signup_step_done`、`feature_used` |

规则：

1. **能映射到 A 就不要造 B**（报表、受众、部分集成更省事）。
2. B 用 `snake_case`，语义稳定，同一动作只保留一个主事件名。
3. 业务字典（中文展示名、渠道字段）留在业务仓；本能力不写某一个国家或某一垂直行业的事件表。

---

## A. Demo 标准预设 · 官方侧（优先用这些）

以下是跨项目默认推荐清单（**demo / 通用 Web 产品**），不是某个游戏业务的字典。

### A1. 自动 / 增强型（通常不用手写）

开启数据流「增强型衡量」后常见：

| 事件 | 含义 |
| --- | --- |
| `page_view` | 页面浏览（SPA 也可改由路由统一手发） |
| `session_start` | 会话开始 |
| `first_visit` | 首次访问 |
| `scroll` | 滚动深度（增强型） |
| `click` | 出站点击（增强型） |
| `view_search_results` | 站内搜索（增强型） |

文档：https://support.google.com/analytics/answer/9216061

### A2. 推荐事件 · 账号与内容（手发）

| 场景 | 事件名 | 常用参数（见官方表） |
| --- | --- | --- |
| 登录成功 | `login` | `method` |
| 注册完成 | `sign_up` | `method` |
| 点选内容 / 卡片 / 列表项 | `select_content` | `content_type`, `item_id` |
| 分享 | `share` | `method`, `content_type`, `item_id` |
| 搜索 | `search` | `search_term` |

### A3. 推荐事件 · 转化 / 电商（手发）

有「浏览货架 → 下单」路径时优先整组官方电商名：

| 场景 | 事件名 |
| --- | --- |
| 看列表 | `view_item_list` |
| 看详情 | `view_item` |
| 选中商品/套餐 | `select_item` |
| 加购 | `add_to_cart` |
| 开始结账 | `begin_checkout` |
| 支付成功 | `purchase` |
| 退款 | `refund` |

参数跟电商文档（`items` / `value` / `currency` / `transaction_id`），不要自创冲突字段名：  
https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

---

## B. Demo 标准预设 · 自定义侧（官方盖不住时再用）

只在官方表**没有对应语义**时启用。下面是跨项目可用的**示意命名**，落地时由业务改写成自己的稳定名：

| 示意名 | 何时用 | 建议参数 |
| --- | --- | --- |
| `cta_click` | 主按钮/行动点点击，且不好塞进 `select_content` | `cta_id`, `page_path` |
| `form_submit` | 表单提交成功（非 `sign_up`/`generate_lead` 场景） | `form_id` |
| `feature_used` | 某功能被使用（产品功能渗透） | `feature_name` |
| `error_shown` | 面向用户的错误态曝光 | `error_code` |
| `pay_failed` | 支付失败（官方无对等推荐名时） | `error_code`, `value`, `currency` |

命名检查：

- 全小写 + 下划线；避免空格、驼峰、中文当事件名。
- 不要用官方已占用名（见推荐事件总表）。
- 需要「按参数做报表拆分」的字段 → 提示用户登记**自定义维度**（见 `analysis.md`）。

过渡期若旧名与新官方名并存：可短期双发，漏斗与报表**只选一侧**，验证后关掉双发。

---

## 加事件检查清单

1. 先查官方推荐事件总表 → 能映射则用 A。
2. 不能映射 → 用 B，登记业务仓字典。
3. 公共参数是否由封装自动带上。
4. 转化类是否带齐 `value` / `currency` / `transaction_id`（若适用）。
5. 参数要进探索/对比 → `analysis.md` 自定义定义。
6. 验收走 `verify.md`（按身份分流）。
