/** 模版：Web/H5 GA4 开关（去业务化）。Measurement ID 只来自 env，勿写死。 */
/**
 * GA4 开关与 Measurement ID（env）。
 * 总开关关闭：不注入脚本、不上报、不打 Debug console。
 */

function readEnv(key) {
  try {
    return import.meta.env?.[key]
  } catch {
    return undefined
  }
}

export function isGaEnabled() {
  try {
    const flag = readEnv('VITE_APP_GA_ENABLED')
    if (flag === 'false' || flag === false) return false
    if (flag === 'true' || flag === true) return true
    // 未配 Measurement ID 时默认关，避免空打点
    return !!getGaMeasurementId()
  } catch {
    return false
  }
}

/** console + GA4 debug_mode；未配置时非 prod 开、prod 关 */
export function isGaDebugLogEnabled() {
  try {
    if (!isGaEnabled()) return false
    const flag = readEnv('VITE_APP_GA_DEBUG_LOG')
    if (flag === 'true' || flag === true) return true
    if (flag === 'false' || flag === false) return false
    return String(readEnv('VITE_APP_ENV') || '') !== 'prod'
  } catch {
    return false
  }
}

export function isGaDebugModeEnabled() {
  return isGaDebugLogEnabled()
}

export function getGaMeasurementId() {
  const id = String(readEnv('VITE_APP_GA_MEASUREMENT_ID') || '').trim()
  return id.indexOf('G-') === 0 ? id : ''
}

export function getGaAppEnv() {
  return String(
    readEnv('VITE_APP_GA_APP_ENV') ||
      readEnv('VITE_APP_ENV') ||
      ''
  ).trim()
}
