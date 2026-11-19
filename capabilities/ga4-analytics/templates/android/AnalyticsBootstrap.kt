package com.example.app.analytics

import android.app.Application
import android.content.Context
import android.os.Bundle
import android.util.Log
import com.google.firebase.analytics.FirebaseAnalytics

/**
 * Android GA4 / Firebase Analytics 启动模版（去业务化）。
 * 沉淀来源：彩铃 App Android FirebaseAnalyticsStartup（已去掉客户包名与业务事件名）。
 *
 * 用法：Application.onCreate → AnalyticsBootstrap.configure(this, debugAnalytics = BuildConfig.DEBUG)
 * DebugView：adb shell setprop debug.firebase.analytics.app <你的包名>
 * 正式包务必清掉本地 debug 标记，避免常规报表长期为 0。
 */
object AnalyticsBootstrap {
    private const val TAG = "AnalyticsBootstrap"

    private val measurementPrefNames =
        listOf(
            "com.google.android.gms.measurement.prefs",
            "google_app_measurement_local_prefs",
        )

    private val debugPrefKeys =
        listOf(
            "debug_mode",
            "debug_logging",
            "firebase_analytics_debug_mode",
        )

    fun configure(application: Application, debugAnalytics: Boolean, appVersionName: String) {
        if (debugAnalytics) {
            enableDebugViewDiagnostics(application)
            return
        }
        clearPersistedDebugFlags(application)
        val analytics = FirebaseAnalytics.getInstance(application)
        analytics.setAnalyticsCollectionEnabled(true)
        analytics.logEvent(
            "app_open",
            Bundle().apply {
                putString("platform", "android")
                putString("build", appVersionName)
            },
        )
    }

    private fun clearPersistedDebugFlags(context: Context) {
        measurementPrefNames.forEach { name ->
            val prefs = context.getSharedPreferences(name, Context.MODE_PRIVATE)
            val editor = prefs.edit()
            var changed = false
            debugPrefKeys.forEach { key ->
                if (prefs.contains(key)) {
                    editor.remove(key)
                    changed = true
                }
            }
            if (changed) {
                editor.apply()
                Log.i(TAG, "Cleared persisted Firebase Analytics debug flags in $name")
            }
        }
    }

    private fun enableDebugViewDiagnostics(application: Application) {
        val analytics = FirebaseAnalytics.getInstance(application)
        analytics.setAnalyticsCollectionEnabled(true)
        analytics.logEvent(
            "debug_view_ping",
            Bundle().apply { putString("source", "android_template") },
        )
        Log.i(
            TAG,
            "Analytics debug: adb shell setprop debug.firebase.analytics.app=${application.packageName}",
        )
    }
}
