/**
 * 示例：落地页 / 短剧 H5 常见漏斗（勿直接当业务字典；按项目裁剪拷到 gaEvents.js）。
 * 沉淀来源：泰国短剧 GA 文件夹 + 彩铃落地页 ga4Track（已去客户名）。
 */

import {
  maskMsisdn,
  safeTrack,
  syncGaUserId,
  trackGaEvent,
  trackOnce,
  trackThrottled
} from './gaCore.js'

export const GA_EVENTS = {
  LANDING_VIEW: 'landing_view',
  LOADING_SUCCESS: 'loading_success',
  PHONE_FILLED: 'phone_filled',
  OTP_REQUEST: 'otp_request',
  OTP_SENT: 'otp_sent',
  OTP_SEND_FAILED: 'otp_send_failed',
  OTP_INPUT: 'otp_input',
  LOGIN: 'login',
  LOGIN_FAILED: 'login_failed',
  LOGIN_SUCCESS: 'login_success',
  SUBSCRIBE_CLICK: 'subscribe_click',
  SUBSCRIBE_SUCCESS: 'subscribe_success',
  SUBSCRIBE_FAILED: 'subscribe_failed'
}

export function trackLandingView(extra = {}) {
  return safeTrack('trackLandingView', () =>
    trackOnce('landing_view', GA_EVENTS.LANDING_VIEW, extra)
  )
}

export function trackPhoneFilled({ phone, isAutoFill = false } = {}) {
  return safeTrack('trackPhoneFilled', () => {
    const msisdnMasked = maskMsisdn(phone)
    if (!msisdnMasked) return false
    syncGaUserId(phone)
    return trackGaEvent(GA_EVENTS.PHONE_FILLED, {
      is_auto_fill: !!isAutoFill,
      msisdn_masked: msisdnMasked
    })
  })
}

export function trackOtpRequest(extra = {}) {
  return safeTrack('trackOtpRequest', () =>
    trackThrottled(`otp_request:${extra.scene || 'default'}`, 1500, GA_EVENTS.OTP_REQUEST, extra)
  )
}

export function trackOtpSent(extra = {}) {
  return trackGaEvent(GA_EVENTS.OTP_SENT, { result: 'success', ...extra })
}

export function trackOtpSendFailed({ failReason, ...extra } = {}) {
  return trackGaEvent(GA_EVENTS.OTP_SEND_FAILED, {
    result: 'fail',
    fail_reason: failReason || 'unknown',
    ...extra
  })
}

export function trackLoginSuccess(extra = {}) {
  return trackGaEvent(GA_EVENTS.LOGIN_SUCCESS, extra)
}

export function trackSubscribeClick(extra = {}) {
  return trackThrottled('subscribe_click', 1200, GA_EVENTS.SUBSCRIBE_CLICK, extra)
}
