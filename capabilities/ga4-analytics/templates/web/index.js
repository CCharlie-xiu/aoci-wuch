/**
 * GA4 对外唯一入口（模版）。业务侧只从此文件夹导入，禁止直接 gtag。
 * 来源：泰国短剧 oversea-tailand/epg/src/utils/ga + 彩铃落地页漏斗经验（去业务化）。
 */

export {
  getGaAppEnv,
  getGaMeasurementId,
  isGaDebugLogEnabled,
  isGaDebugModeEnabled,
  isGaEnabled
} from './gaConfig'

export { captureGaChannelContext, getGaChannelContext } from './gaChannel'

export {
  buildGaCommonParams,
  clearGaUserId,
  ensureGaScript,
  getGaPagePath,
  maskMsisdn,
  safeTrack,
  syncGaUserId,
  trackGaEvent,
  trackOnce,
  trackThrottled,
  resetTrackOnce
} from './gaCore'

export {
  GA_EVENTS,
  trackLandingView
} from './gaEvents'
