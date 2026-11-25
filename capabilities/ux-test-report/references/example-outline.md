# 样例大纲（结构参考）

仅作结构与口径示范。真实字段以当时仓库为准；不写密钥。

## 元信息

- 时间窗：11/24–11/25
- 分支：`feature/content-block-override`
- 端：海外短剧 H5（示例）

## 用户侧变化（摘录）

| 日期 | 模块 | 变化 |
| --- | --- | --- |
| 11/24 | 订购·内容拦截 | 开了内容拦截的号，订购时多一步确认页 |
| 11/25 | WhatsApp 分享 | 手机分享后能回播放页，不白屏 |
| 11/25 | 套餐切换 | 弹窗内换日包/月包，不整页闪 |

## 代码 / 接口对照（摘录）

| 模块 | 实现要点 |
| --- | --- |
| Content Block | `sendSms` 外层 `code=300104` → Override；`subscribe` 带 `isContentBlock` / `contentBlockRes` |
| 分享 | 移动端 `location.assign`，禁 `window.open(_blank)` |
| Evina | 切套餐只清 tx 不 reload；缺码才 reload；防 autoSubmit 死循环 |

## 用例三列（摘录）

| # | 怎么测 | 怎样算过 | 代码期望 |
| --- | --- | --- | --- |
| 1 | 用开了内容拦截的号去订购，点提交 | 先出确认页，不是直接进验证码 | `sendSms` 外层 `code=300104`；`step=contentBlock` |
| 2 | 确认页点同意 → 输 OTP → 确认订购 | 订购成功，能正常看剧 | `subscribe`：`isContentBlock=1, contentBlockRes=1` |
| 10 | 真机：播放页分享到 WhatsApp 再返回 | 回到播放页，不是白屏 | `openExternalShare` → `location.assign` |

## 优先顺序

先 1–5、10–12；再补其余。

## 交付

- `sa-mobireelz-test-report.md`
- `sa-mobireelz-test-report.html`（浏览器打开即可）
