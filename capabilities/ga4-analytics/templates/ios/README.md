# iOS GA4（Firebase Analytics）模版

**来源**：彩铃双端 iOS App 启动处 Analytics 配置（已去业务事件名）。

## 接入

1. 工程已接 Firebase（`GoogleService-Info.plist`，勿把密钥写进能力库）
2. 拷贝 `AnalyticsBootstrap.swift`、`AnalyticsTracker.swift`
3. `App.init` 顺序与 Bootstrap 注释一致
4. Scheme 联调 DebugView：Arguments 加 `-FIRDebugEnabled`
5. 业务只用 `AnalyticsTracker`；User-ID 用 `setUserId`

## 注意

- 曾开 DebugView 的模拟器，正式 Run 前必须清 UserDefaults debug 标记（Bootstrap 已处理）
- App 心跳用自定义 `app_open`，不要用 Web 的 `page_view` 判断 App 是否上报
