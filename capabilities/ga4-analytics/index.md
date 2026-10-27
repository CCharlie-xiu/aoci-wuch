# ga4-analytics

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`ga4-analytics[KD8SH]`

F: 在 H5/Web 项目落地 GA4 埋点与基础分析：接入、事件设计、联调验收、排障与看数
R:
A: 角色场景见 `roles-qa.md`（仅开发者/使用者，互相协助 + 模版问答）；再任务路由；文档 `method.md` / `setup.md` / `event-design.md` / `verify.md` / `analysis.md` / `user-analysis.md` / `code-map.md`；覆盖不到时走 `gap-protocol.md`；页面分工见下文
S: 角色只有开发者与使用者两种（可一人兼两角或多人数人）；模版问答须在阅读本技能后发出/作答；先分清官方与自定义事件；User-ID 禁止当事件参数；DebugView ≠ 正式报表；任务超出本能力覆盖先联网查官方再答，控制台路径与官方页必须核实，未核实要标注；密钥与业务字典不进本能力

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
| 按用户筛选 / 看某个用户做了什么 | 命中 → `user-analysis.md` |
| 我们的事件叫什么 / 代码和后台怎么对上 | 命中 → `code-map.md` + 模版 E |
| 要协作提问 / 对方该回什么 | 命中 → `roles-qa.md` 模版 |
| 只问广告归因 / BigQuery / Firebase 原生 | 非本能力主线，走 `gap-protocol.md` |
| 以上都没覆盖 | `gap-protocol.md` |

## 角色场景区分（重点 · 先于任务路由）

**只存在两种角色：开发者 / 使用者。** 可一人兼两角，可多人分角；不变的是不会出现第三种角色。

| 当前角色 | AI 主责 | 协作动作（读技能后） |
| --- | --- | --- |
| **开发者** | 验证结果对不对、有没有效果 | 向使用者**发出**模版 A：问清「现在看到什么 / 想实现什么」；看到填空后协助对照验收 |
| **使用者** | 不清楚时解答；涉及具体内容时收口需求 | 先模版 D 解答；要落地则**发出**模版 B；要事件名清单则发模版 E；看到开发者模版 A 时按答法回填 |

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
| 按用户筛选 / 单个用户 | `user-analysis.md` | 路径 + 前提（user_id、报告身份、保留期）逐项过 |
| 事件叫什么 / 代码对后台 | `code-map.md`（+ 模版 E） | 事件字典已填；代码、DebugView、事件列表三处名字一致 |
| 本能力没覆盖 | `gap-protocol.md` | 来源 URL + 核对日期；未核实项已标注 |

决策细节见 `method.md`。

## 页面分工（必守）

链接与路径**只在本节维护**，其他文件引用本节。核对日期 2026-10-27。

状态：`✓` 已抓取到页面；`~` 官方页内链接，本次未抓取；失效链接已移除。

### A. AI 可搜索 / 可拉取的文档页

用来核对 API、事件名、参数，也是 `gap-protocol.md` 的检索起点。**不要**当作用户操作界面。

| 用途 | URL | 状态 |
| --- | --- | --- |
| 站内检索根（开发者） | https://developers.google.com/analytics | ✓ |
| 站内检索根（帮助中心） | https://support.google.com/analytics | ✓ |
| GA4 收集总览 | https://developers.google.com/analytics/devguides/collection/ga4 | ~ |
| gtag 事件 | https://developers.google.com/analytics/devguides/collection/ga4/events | ✓ |
| 推荐事件列表 | https://developers.google.com/analytics/devguides/collection/ga4/reference/events | ✓ |
| 自动收集事件 | https://support.google.com/analytics/answer/9234069 | ✓ |
| 增强型衡量 | https://support.google.com/analytics/answer/9216061 | ✓ |
| 自定义事件 | https://support.google.com/analytics/answer/12229021 | ~ |
| 电商事件 | https://developers.google.com/analytics/devguides/collection/ga4/ecommerce | ✓ |
| 发送 User-ID | https://developers.google.com/analytics/devguides/collection/ga4/user-id | ✓ |
| User-ID 最佳实践 | https://support.google.com/analytics/answer/12675187 | ✓ |
| 跨平台 User-ID / 报告身份 | https://support.google.com/analytics/answer/9213390 | ~ |
| DebugView | https://support.google.com/analytics/answer/7201382 | ✓ |
| 实时报告 | https://support.google.com/analytics/answer/9271392 | ~ |
| 事件报告（互动度主题） | https://support.google.com/analytics/answer/10999789 | ~ |
| 自定义维度 | https://support.google.com/analytics/answer/10075209 | ~ |
| 探索总览 | https://support.google.com/analytics/answer/7579450 | ✓ |
| 漏斗探索 | https://support.google.com/analytics/answer/9327974 | ~ |
| 用户探索 | https://support.google.com/analytics/answer/9283607 | ✓ |
| 数据保留 | https://support.google.com/analytics/answer/7667196 | ✓ |
| 关键事件 | https://support.google.com/analytics/answer/9267568 | ✓ |
| 电商购买报告 | https://support.google.com/analytics/answer/9214129 | ~ |
| BigQuery 导出 | https://developers.google.com/analytics/bigquery/ | ~ |

### B. 需提示用户打开的控制台页

入口统一 https://analytics.google.com/ ；界面中文名以用户实际显示为准。

| 用途 | 用户路径（话术） | 状态 |
| --- | --- | --- |
| 属性总览 | 选对「账号 / 属性」 | ✓ |
| 数据流 / Measurement ID | 管理 → 数据收集和修改 → 数据流 → Web → 复制衡量 ID（`G-…`） | ✓ |
| 增强型衡量开关 | 管理 → 数据流 → 点数据流名称 → 增强型衡量 | ✓ |
| DebugView | 管理 → 数据展示 → DebugView | ✓ |
| 实时 | 报告 → 实时 | ~ |
| 事件列表（含自定义） | 报告 → 互动度 → 事件 | ✓ |
| 自定义定义 | 管理 → 数据展示 → 自定义定义 | ~ |
| 探索 / 漏斗 | 探索 → 漏斗探索 | ✓ |
| 用户探索 | 探索 → 模板库（Template Gallery）→ 用户探索（User explorer） | ✓ |
| 报告身份 | 管理 → 数据展示 → 报告身份（Reporting identity） | ✓ |
| 数据保留 | 管理 → 数据设置 → 数据保留 | ✓ |

交付时至少一句可照做的话：

```text
请打开 https://analytics.google.com/ → 选对属性 → 管理 → 数据展示 → DebugView（开发联调）
或 → 报告 → 互动度 → 事件（使用者看官方/自定义事件是否进列表）。
```

## 怎么用

1. **先定角色**（开发者 / 使用者；兼角须声明当前以哪角发言）。  
2. 信息缺口用 `roles-qa.md` 模版：**读技能后发出提问 / 读技能后看到提问再答**。  
3. 再走任务路由；只读需要的文件。  
4. **路由表没覆盖**：先走 `gap-protocol.md`，不凭记忆答。  
5. 事件预设以 `event-design.md` 的官方 A + 通用自定义 B 为准；不写入具体业务字典。  
6. 验收走 `verify.md` 对应角色章节；看数走 `analysis.md` / `user-analysis.md`；代码对后台走 `code-map.md`。

## 最不能违反什么

- 不发明第三种角色；不把兼角当成新流程。  
- 不跳过模版臆造「对方想看什么 / 已经看到什么」。  
- 不把某一业务事件表写成全局预设。  
- 不把 Measurement ID、密钥、真实用户标识规则写进本能力。  
- 不把 User-ID 塞进事件参数、用户属性、自定义维度。  
- 不在开关关闭时宣称「已经上报成功」。  
- 不拿「实时有数」冒充「探索报表已稳定」。  
- 不对使用者只堆代码，不对开发者只堆老板话术。  
- 不凭记忆补控制台菜单路径；本能力没覆盖或未核实的，先查官方，查不到就标注「未核实」。  
- 不拿博客、论坛当依据；官方查不到才可参考，且必须标注来源类型。
