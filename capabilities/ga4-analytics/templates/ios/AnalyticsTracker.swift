import FirebaseAnalytics
import Foundation

/// iOS 事件封装模版。业务只调本类型，禁止各处直接 Analytics.logEvent。
enum AnalyticsTracker {
    static func setUserId(_ userId: String?) {
        Analytics.setUserID(userId?.isEmpty == false ? userId : nil)
    }

    static func log(_ name: String, parameters: [String: String] = [:]) {
        var params: [String: Any] = [:]
        parameters.forEach { key, value in
            if !value.isEmpty { params[key] = value }
        }
        Analytics.logEvent(name, parameters: params.isEmpty ? nil : params)
    }

    static func screenView(screenName: String, screenClass: String? = nil) {
        log(
            AnalyticsEventScreenView,
            parameters: [
                AnalyticsParameterScreenName: screenName,
                AnalyticsParameterScreenClass: screenClass ?? screenName,
            ]
        )
    }
}
