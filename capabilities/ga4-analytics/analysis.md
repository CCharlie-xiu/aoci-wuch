# analysis.md · 看数：官方事件 / 自定义事件 / 漏斗

分析发生在用户的 Analytics 控制台。AI 负责：说清「看哪一类事件、打开哪一页、漏斗怎么配」；**不编造后台数字**。

入口：https://analytics.google.com/

配套文档：

| 用途 | URL |
| --- | --- |
| 事件报告（怎么看事件） | https://support.google.com/analytics/answer/13316685 |
| 实时报告 | https://support.google.com/analytics/answer/9271392 |
| DebugView | https://support.google.com/analytics/answer/7201382 |
| 自定义事件 | https://support.google.com/analytics/answer/12229021 |
| 自定义维度 / 指标 | https://support.google.com/analytics/answer/10075209 |
| 探索总览 | https://support.google.com/analytics/answer/7579450 |
| 漏斗探索 | https://support.google.com/analytics/answer/9329390 |
| 关键事件（转化） | https://support.google.com/analytics/answer/9267568 |
| 电商购买报告 | https://support.google.com/analytics/answer/9214129 |

---

## 官方事件 vs 自定义事件 · 在平台哪里看

两类事件**都会**出现在事件列表里；差别在于：官方推荐更容易进标准报表/变现模板，自定义要自己配探索与维度。

| 你想确认什么 | 打开（话术） | 官方事件 | 自定义事件 |
| --- | --- | --- | --- |
| 刚打的点有没有进来（联调） | 管理 → DebugView | 看事件名与参数 | 同样看事件名与参数 |
| 此刻有没有量 | 报告 → 实时 → 按事件名称 | 可见 | 可见（同列表） |
| 某事件总量 / 趋势 | 报告 → 互动度 → 事件 | 可见 | 可见；新事件可能延迟数小时 |
| 事件详情与参数 | 互动度 → 事件 → 点进事件名 | 常见参数更易出模板 | 参数要进报表须先登记自定义维度 |
| 购买 / 收入类 | 报告 → 变现（需规范电商事件） | `purchase` 等走变现 | 自创支付名通常**进不了**标准变现模板 |
| 自由组合路径 | 探索 → 漏斗 / 路径 / 自由形式 | 可选 | 可选（名称要稳定） |

话术（自定义事件）：

```text
请打开 analytics.google.com → 选对属性
→ 报告 → 互动度 → 事件
→ 在列表里找你的自定义事件名（如 feature_used）
→ 点进去看次数；若要按参数拆分，先去「管理 → 数据展示 → 自定义定义」登记该参数
```

---

## 自定义维度（自定义参数要「能分析」时）

自定义事件的参数默认不一定能当报表维度用。

1. 管理 → 数据展示 → 自定义定义 → 创建自定义维度  
2. 范围选「事件」；参数名与代码里发出的 key **完全一致**  
3. 登记后对新采集数据生效（历史通常不回填）

文档：https://support.google.com/analytics/answer/10075209

---

## 漏斗怎么配（通用步骤，不绑某一业务）

文档：https://support.google.com/analytics/answer/9329390

### 配置步骤（提示用户照做）

```text
1. 打开 analytics.google.com → 选对属性
2. 左侧「探索」→ 新建探索 → 选「漏斗探索」
3. 在「步骤」里按转化顺序添加事件（每步一个事件名）
4. 步骤之间可设「间接跟随」或「直接跟随」（按产品路径松紧）
5. 需要拆渠道/设备时，把维度拖到「细分」
6. 若某步是自定义事件且要按参数过滤，先确认该参数已登记自定义维度
```

### 选事件的原则

| 原则 | 说明 |
| --- | --- |
| 同漏斗只用一套命名体系 | 不要同一步同时放 `purchase` 与旧自定义支付成功名（双计） |
| 优先官方推荐名 | 例如 `login` → `select_content` → `begin_checkout` → `purchase` |
| 自定义只能当「官方盖不住」的步骤 | 例如中间插 `feature_used` |
| 步骤 3～7 个为宜 | 过多难读；过少看不出断点 |

### Demo 标准漏斗模板（通用 Web 转化）

按产品裁剪，**不要默认套游戏大厅路径**：

| 步骤 | 优先事件 | 备选（仅官方不够时） |
| --- | --- | --- |
| 1 进入 | `page_view` | — |
| 2 身份 | `login` 或 `sign_up` | — |
| 3 关键行为 | `select_content` | `cta_click` / `feature_used` |
| 4 进入转化页 | `view_item` / `view_item_list` | — |
| 5 发起支付 | `begin_checkout` | — |
| 6 成交 | `purchase` | `pay_failed` 不要放进成功漏斗 |

话术示例：

```text
请打开 探索 → 漏斗探索，步骤建议：
page_view → login → select_content → begin_checkout → purchase
若某步仍是自定义事件名，漏斗里填那个稳定名；不要和官方同义事件混用。
```

### 标记关键事件（可选）

要把某步当成「转化」看：管理 → 数据展示 → 事件 → 把该事件标为关键事件。  
文档：https://support.google.com/analytics/answer/9267568

---

## 边界

- 新事件进标准报告可能延迟数小时；联调以 DebugView 为准。
- 不覆盖广告投放归因、BigQuery、Firebase 原生全家桶。
- 具体业务事件名留在业务仓，不要写进本能力或当成全局预设。
