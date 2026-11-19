/**
 * 本项目事件字典（唯一随业务变的文件）。
 * 起步只含 landing_view；漏斗示例见 gaEvents.example-funnel.js。
 */

import { safeTrack, trackOnce } from './gaCore.js'

/** @type {Record<string, string>} */
export const GA_EVENTS = {
  LANDING_VIEW: 'landing_view'
}

export function trackLandingView(extra = {}) {
  return safeTrack('trackLandingView', () =>
    trackOnce('landing_view', GA_EVENTS.LANDING_VIEW, extra)
  )
}
