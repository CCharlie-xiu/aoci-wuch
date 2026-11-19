import FirebaseAnalytics
import FirebaseCore
import Foundation

/**
 iOS GA4 / Firebase Analytics 启动模版（去业务化）。
 沉淀来源：彩铃 App RingtoneWorldApp 中 Analytics 启动与 DebugView 清理逻辑。

 在 App.init / didFinishLaunching：
   AnalyticsBootstrap.applyDebugModeBeforeConfigure()
   FirebaseApp.configure()
   Analytics.setAnalyticsCollectionEnabled(true)
   AnalyticsBootstrap.logAppOpenIfNeeded(build: buildNumber)
 */
enum AnalyticsBootstrap {
    private static let measurementDebugKey = "/google/measurement/debug_mode"
    private static let firebaseDebugKey = "/google/firebase/debug_mode"

    /// DebugView 会把标记写入 UserDefaults；Release / 未带 -FIRDebugEnabled 的 Run 必须清掉。
    static func applyDebugModeBeforeConfigure() {
        #if DEBUG
        let enableDebugView = ProcessInfo.processInfo.arguments.contains("-FIRDebugEnabled")
        if enableDebugView {
            UserDefaults.standard.set(true, forKey: measurementDebugKey)
            UserDefaults.standard.set(true, forKey: firebaseDebugKey)
        } else {
            UserDefaults.standard.removeObject(forKey: measurementDebugKey)
            UserDefaults.standard.removeObject(forKey: firebaseDebugKey)
        }
        #else
        UserDefaults.standard.removeObject(forKey: measurementDebugKey)
        UserDefaults.standard.removeObject(forKey: firebaseDebugKey)
        #endif
    }

    /// 非 DebugView 通道时打心跳事件，便于实时检索（自定义名用 app_open，勿依赖 page_view 判断 App）。
    static func logAppOpenIfNeeded(build: String) {
        guard !UserDefaults.standard.bool(forKey: measurementDebugKey) else { return }
        Analytics.logEvent(
            "app_open",
            parameters: [
                "platform": "ios",
                "build": build,
            ]
        )
    }
}
