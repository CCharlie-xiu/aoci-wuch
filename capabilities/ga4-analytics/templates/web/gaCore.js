/**
 * GA4 发送核：注入 gtag、合并公共参数、safeTrack、once/throttle、官方 user_id。
 * 业务事件请走 gaEvents.js，不要在业务文件里直接调 gtag。
 */

import {
  getGaAppEnv,
  getGaMeasurementId,
  isGaDebugLogEnabled,
  isGaDebugModeEnabled,
  isGaEnabled
} from './gaConfig'
import { getGaChannelContext } from './gaChannel'

let gaScriptRequested = false
/** @type {string} */
let lastSyncedGaUserId = ''

/**
 * @param {string} label
 * @param {Function} fn
 */
export function safeTrack(label, fn) {
  try {
    return fn()
  } catch (error) {
    if (isGaDebugLogEnabled()) {
      console.warn(`[GA4] swallowed (${label}):`, error)
    }
    return false
  }
}

function gaConfigExtras() {
  return isGaDebugModeEnabled() ? { debug_mode: true } : {}
}

export function ensureGaScript() {
  return safeTrack('ensureGaScript', () => {
    if (!isGaEnabled()) return false
    if (typeof window === 'undefined' || typeof document === 'undefined') return false
    const measurementId = getGaMeasurementId()
    if (!measurementId) return false
    if (gaScriptRequested) return true
    gaScriptRequested = true

    window.dataLayer = window.dataLayer || []
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
    }

    const alreadyHasTag = !!document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`
    )
    if (!alreadyHasTag) {
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.appendChild(s)
    }

    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      send_page_view: false,
      ...gaConfigExtras()
    })
    return true
  })
}

export function getGaPagePath() {
  return safeTrack('getGaPagePath', () => {
    if (typeof window === 'undefined') return ''
    const hash = String(window.location.hash || '')
    if (hash) return hash.split('?')[0] || hash
    return String(window.location.pathname || '')
  }) || ''
}

/** 公共参数：channel / batch_id / page_path / app_env */
export function buildGaCommonParams(extra = {}) {
  const ch = getGaChannelContext()
  const payload = {
    channel: ch.channel || 'direct',
    batch_id: ch.batch_id || undefined,
    page_path: getGaPagePath() || undefined,
    app_env: getGaAppEnv() || undefined,
    ...extra
  }
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
      delete payload[key]
    }
  })
  return payload
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [params]
 */
export function trackGaEvent(eventName, params = {}) {
  return safeTrack(`trackGaEvent:${eventName || 'unknown'}`, () => {
    if (!eventName || !isGaEnabled()) return false
    ensureGaScript()
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false
    const measurementId = getGaMeasurementId()
    if (!measurementId) return false

    const payload = buildGaCommonParams(params || {})
    window.gtag('event', eventName, {
      send_to: measurementId,
      ...payload
    })
    if (isGaDebugLogEnabled()) {
      console.log('[GA4] event:', eventName, payload)
    }
    return true
  })
}

/**
 * 官方 User-ID；禁止写入事件 params / user_properties 冒充。
 * @param {string} phone
 */
export function syncGaUserId(phone) {
  return safeTrack('syncGaUserId', () => {
    if (!isGaEnabled()) return false
    ensureGaScript()
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false
    const measurementId = getGaMeasurementId()
    if (!measurementId) return false
    const userId = String(phone || '').replace(/\D/g, '')
    if (!userId || userId === lastSyncedGaUserId) return false
    window.gtag('set', { user_id: userId })
    window.gtag('config', measurementId, {
      user_id: userId,
      send_page_view: false,
      update: true,
      ...gaConfigExtras()
    })
    lastSyncedGaUserId = userId
    if (isGaDebugLogEnabled()) {
      console.log('[GA4] user_id synced')
    }
    return true
  })
}

export function clearGaUserId() {
  return safeTrack('clearGaUserId', () => {
    if (!isGaEnabled()) return false
    ensureGaScript()
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false
    const measurementId = getGaMeasurementId()
    if (!measurementId) return false
    window.gtag('set', { user_id: null })
    window.gtag('config', measurementId, {
      user_id: null,
      send_page_view: false,
      update: true,
      ...gaConfigExtras()
    })
    lastSyncedGaUserId = ''
    return true
  })
}

export function maskMsisdn(phone = '') {
  return (
    safeTrack('maskMsisdn', () => {
      const str = String(phone || '').replace(/\D/g, '')
      if (!str) return ''
      if (str.length <= 5) return '*'.repeat(str.length)
      const head = str.slice(0, 3)
      const tail = str.slice(-2)
      return `${head}${'*'.repeat(Math.max(str.length - 5, 2))}${tail}`
    }) || ''
  )
}

/** 简易 once：同一 key 只允许成功上报一次 */
const onceStore = Object.create(null)

export function trackOnce(flagKey, eventName, params) {
  return safeTrack(`trackOnce:${flagKey}`, () => {
    if (!flagKey) return false
    if (onceStore[flagKey]) return false
    const ok = trackGaEvent(eventName, params)
    if (ok) onceStore[flagKey] = true
    return ok
  })
}

export function resetTrackOnce(flagKey) {
  if (flagKey) delete onceStore[flagKey]
}

/** 节流：同一 key 在 windowMs 内只报一次成功 */
const throttleAt = Object.create(null)

export function trackThrottled(throttleKey, windowMs, eventName, params) {
  return safeTrack(`trackThrottled:${throttleKey}`, () => {
    const now = Date.now()
    const last = Number(throttleAt[throttleKey]) || 0
    if (now - last < (Number(windowMs) || 0)) return false
    const ok = trackGaEvent(eventName, params)
    if (ok) throttleAt[throttleKey] = now
    return ok
  })
}
