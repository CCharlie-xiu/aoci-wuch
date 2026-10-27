# ga4-analytics

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`ga4-analytics[KD8SH]`

F: 在 H5/Web 项目落地 GA4 埋点与基础分析：接入、事件设计、联调验收、排障与看数
R:
A: 角色场景见 `roles-qa.md`（仅开发者/使用者，互相协助 + 模版问答）；再任务路由；文档 `method.md` / `setup.md` / `event-design.md` / `verify.md` / `analysis.md`；页面分工见下文
S: 角色只有开发者与使用者两种（可一人兼两角或多人数人）；模版问答须在阅读本技能后发出/作答；先分清官方与自定义事件；User-ID 禁止当事件参数；DebugView ≠ 正式报表；密钥与业务字典不进本能力

---

## 这是什么

Skill：告诉 AI **怎么把 GA4 接到能验收**，以及 **怎么在开发者 ↔ 使用者之间用模版互相协助**。

不实现 gtag 本体，不托管 Measurement ID。跨项目复用：角色场景、模版问答、官方/自定义边界、验收标准、页面分工。业务事件字典与项目路径留在业务仓，**不写入本能力**。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 接谷歌埋点 / 上 GA4 / 加 analytics | 命中 → 接入（偏开发者） |
| 加登录/点击/支付等事件 | 命中 → 事件设计（先官方后自定义） |
| 为什么没数 / DebugView 空 | 命中 → 排障（按角色） |
| 看转化漏斗 / 日活 / 自定义事件在哪 | 命中 → 分析（偏使用者） |
| 要协作提问 / 对方该回什么 | 命中 → `roles-qa.md` 模版 |
| 只问广告归因 / BigQuery / Firebase 原生 | 非本能力主线 |

## 角色场景区分（重点 · 先于任务路由）

**只存在两种角色：开发者 / 使用者。** 可一人兼两角，可多人分角；不变的是不会出现第三种角色。

| 当前角色 | AI 主责 | 协作动作（读技能后） |
| --- | --- | --- |
| **开发者** | 验证结果对不对、有没有效果 | 向使用者**发出**模版 A：问清「现在看到什么 / 想实现什么」；看到填空后协助对照验收 |
| **使用者** | 不清楚时解答；涉及具体内容时收口需求 | 先模版 D 解答；要落地则**发出**模版 B；看到开发者模版 A 时按答法回填 |

全文与可复制模版：`roles-qa.md`。  
子话术（运营/产品/老板/学习）仍属使用者，见 `method.md` §0。

## 任务路由

| 用户意图 | 读哪些 | 完成标准 |
| --- | --- | --- |
| 角色不清 / 要协作提问 | `roles-qa.md` | 发出或答完对应模版 |
| 新项目接 GA | `setup.md` → `verify.md`（+ 必要时模版 A） | DebugView 见到约定首事件；使用者侧见闻已对齐 |
| 加 / 改事件 | `event-design.md` → `verify.md`（+ 模版 A/B） | 官方/自定义分清；双方对事件名一致 |
| 查为什么不上报 | `method.md` 排障 → `verify.md` | 定位到开关/环境/脚本/选错属性之一 |
| 看报表、自定义事件、漏斗 | `analysis.md`（+ 模版 D/B） | 控制台路径 + 文档链接 + 漏斗步骤 |

决策细节见 `method.md`。

## 页面分工（必守）

### A. AI 可搜索 / 可拉取的文档页

用来核对 API、事件名、参数。**不要**当作用户操作界面。

| 用途 | URL |
| --- | --- |
| GA4 收集总览 | https://developers.google.com/analytics/devguides/collection/ga4 |
| gtag 事件 | https://developers.google.com/analytics/devguides/collection/ga4/events |
| 推荐事件列表 | https://developers.google.com/analytics/devguides/collection/ga4/reference/events |
| 自动收集事件 | https://support.google.com/analytics/answer/9234069 |
| 增强型衡量 | https://support.google.com/analytics/answer/9216061 |
| 自定义事件 | https://support.google.com/analytics/answer/12229021 |
| User-ID | https://developers.google.com/analytics/devguides/collection/ga4/userid |
| 电商事件 | https://developers.google.com/analytics/devguides/collection/ga4/ecommerce |
| DebugView | https://support.google.com/analytics/answer/7201382 |
| 事件报告 | https://support.google.com/analytics/answer/13316685 |
| 自定义维度 | https://support.google.com/analytics/answer/10075209 |
| 漏斗探索 | https://support.google.com/analytics/answer/9329390 |
| 关键事件 | https://support.google.com/analytics/answer/9267568 |

### B. 需提示用户打开的控制台页

| 用途 | 入口 | 用户路径（话术） |
| --- | --- | --- |
| 属性总览 | https://analytics.google.com/ | 选对「账号 / 属性」 |
| 数据流 / Measurement ID | 同上 | 管理 → 数据流 → Web → 复制衡量 ID（`G-…`） |
| DebugView | 同上 | 管理 → DebugView |
| 实时 | 同上 | 报告 → 实时 |
| 事件列表（含自定义） | 同上 | 报告 → 互动度 → 事件 |
| 自定义定义 | 同上 | 管理 → 数据展示 → 自定义定义 |
| 探索 / 漏斗 | 同上 | 探索 → 漏斗探索 |

交付时至少一句可照做的话：

```text
请打开 https://analytics.google.com/ → 选对属性 → 管理 → DebugView（开发联调）
或 → 报告 → 互动度 → 事件（使用者看官方/自定义事件是否进列表）。
```

## 怎么用

1. **先定角色**（开发者 / 使用者；兼角须声明当前以哪角发言）。  
2. 信息缺口用 `roles-qa.md` 模版：**读技能后发出提问 / 读技能后看到提问再答**。  
3. 再走任务路由；只读需要的文件。  
4. 事件预设以 `event-design.md` 的官方 A + 通用自定义 B 为准；不写入具体业务字典。  
5. 验收走 `verify.md` 对应角色章节；看数走 `analysis.md`。

## 最不能违反什么

- 不发明第三种角色；不把兼角当成新流程。  
- 不跳过模版臆造「对方想看什么 / 已经看到什么」。  
- 不把某一业务事件表写成全局预设。  
- 不把 Measurement ID、密钥、真实用户标识规则写进本能力。  
- 不把 User-ID 塞进事件参数。  
- 不在开关关闭时宣称「已经上报成功」。  
- 不拿「实时有数」冒充「探索报表已稳定」。  
- 不对使用者只堆代码，不对开发者只堆老板话术。  
 
