/**
 * 渠道 / 批次解析与 session 持久化，供 GA 公共字段使用。
 */

const STORAGE_KEY = 'ga_channel_ctx'

/** @type {Record<string, string> | null} */
let cached = null

function emptyCtx() {
  return {
    channel: 'direct',
    batch_id: ''
  }
}

function normalizeStr(v) {
  return v == null ? '' : String(v).trim()
}

function readQueryObject() {
  const out = {}
  try {
    if (typeof window === 'undefined') return out
    const search = String(window.location.search || '')
    if (search.length > 1) {
      new URLSearchParams(search.slice(1)).forEach((value, key) => {
        out[key] = value
      })
    }
    const hash = String(window.location.hash || '')
    const qIdx = hash.indexOf('?')
    if (qIdx >= 0) {
      new URLSearchParams(hash.slice(qIdx + 1)).forEach((value, key) => {
        out[key] = value
      })
    }
  } catch {
    /* ignore */
  }
  return out
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {Record<string, string>}
 */
function pickChannelFields(raw) {
  const q = raw && typeof raw === 'object' ? raw : {}
  const channel =
    normalizeStr(q.channel) ||
    normalizeStr(q.entrance_channel) ||
    normalizeStr(q.utm_source) ||
    normalizeStr(q.from) ||
    normalizeStr(q.source) ||
    'direct'
  const batch_id =
    normalizeStr(q.batch_id) ||
    normalizeStr(q.batch) ||
    normalizeStr(q.batchId) ||
    ''
  return { channel: channel || 'direct', batch_id }
}

function persist(ctx) {
  cached = { ...ctx }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx))
  } catch {
    /* ignore */
  }
}

function loadStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return { ...emptyCtx(), ...pickChannelFields(parsed) }
  } catch {
    return null
  }
}

/**
 * App 启动时调用：有渠道/批次信号则覆盖，否则保留 session 或 direct
 * @param {Record<string, unknown>} [extraQuery]
 */
export function captureGaChannelContext(extraQuery) {
  const fromUrl = readQueryObject()
  const merged = {
    ...fromUrl,
    ...(extraQuery && typeof extraQuery === 'object' ? extraQuery : {})
  }
  const next = pickChannelFields(merged)
  const hasSignal =
    (next.channel && next.channel !== 'direct') || !!next.batch_id

  const prev = cached || loadStored() || emptyCtx()
  if (hasSignal) {
    persist({
      channel: next.channel || prev.channel || 'direct',
      batch_id: next.batch_id || prev.batch_id || ''
    })
  } else if (!cached) {
    persist(prev.channel ? prev : emptyCtx())
  }
  return getGaChannelContext()
}

/** @returns {{ channel: string, batch_id: string }} */
export function getGaChannelContext() {
  if (!cached) {
    cached = loadStored() || emptyCtx()
  }
  return { ...cached }
}
