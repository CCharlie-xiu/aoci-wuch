package com.example.app.analytics

import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics

/**
 * Android 事件封装模版。业务只调本类，禁止散落 FirebaseAnalytics.logEvent。
 */
class AnalyticsTracker(private val analytics: FirebaseAnalytics) {

    fun setUserId(userId: String?) {
        analytics.setUserId(userId?.takeIf { it.isNotBlank() })
    }

    fun log(event: String, params: Map<String, String> = emptyMap()) {
        val bundle = Bundle()
        params.forEach { (k, v) -> if (v.isNotBlank()) bundle.putString(k, v) }
        analytics.logEvent(event, bundle)
    }

    fun screenView(screenName: String, screenClass: String = screenName) {
        log(
            FirebaseAnalytics.Event.SCREEN_VIEW,
            mapOf(
                FirebaseAnalytics.Param.SCREEN_NAME to screenName,
                FirebaseAnalytics.Param.SCREEN_CLASS to screenClass,
            ),
        )
    }
}
