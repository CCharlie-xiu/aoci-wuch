# Android GA4（Firebase Analytics）模版

**来源**：彩铃双端 Android `FirebaseAnalyticsStartup`（已去业务包名/事件名）。

## 接入

1. 工程已接 Firebase / `google-services.json`（勿把正式密钥提交进能力库）
2. 拷贝 `AnalyticsBootstrap.kt`、`AnalyticsTracker.kt`，改 package
3. `Application.onCreate`：`AnalyticsBootstrap.configure(this, BuildConfig.DEBUG, BuildConfig.VERSION_NAME)`
4. 业务用 `AnalyticsTracker`；User-ID 用 `setUserId`，禁止塞进事件参数冒充

## DebugView

```bash
adb shell setprop debug.firebase.analytics.app <applicationId>
```

正式包启动前清本地 debug 标记（Bootstrap 已处理）。关闭调试：

```bash
adb shell setprop debug.firebase.analytics.app . 
```
