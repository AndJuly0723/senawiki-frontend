import { get, post, put, del } from '../request'

export const TIP_ENDPOINT = '/api/tip'

const LIST_CACHE_TTL_MS = 60 * 1000
const listCache = new Map()

const now = () => Date.now()

const normalizeParams = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value != null && value !== '')
  entries.sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries)
}

const makeListKey = (params = {}) => JSON.stringify(normalizeParams(params))

const readListCache = (key) => {
  const entry = listCache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now()) {
    listCache.delete(key)
    return null
  }
  return entry.value
}

const readPending = (key) => listCache.get(key)?.pending ?? null

const writePending = (key, pending) => {
  const entry = listCache.get(key) ?? { value: null, expiresAt: 0, pending: null }
  entry.pending = pending
  entry.expiresAt = now() + LIST_CACHE_TTL_MS
  listCache.set(key, entry)
}

const writeListCache = (key, value) => {
  const entry = listCache.get(key) ?? { value: null, expiresAt: 0, pending: null }
  entry.value = value
  entry.pending = null
  entry.expiresAt = now() + LIST_CACHE_TTL_MS
  listCache.set(key, entry)
  return value
}

const clearPending = (key) => {
  const entry = listCache.get(key)
  if (!entry) return
  entry.pending = null
  listCache.set(key, entry)
}

const invalidateTipListCache = () => {
  listCache.clear()
}

export const fetchTipPosts = (params = {}) => {
  const normalized = normalizeParams(params)
  const key = makeListKey(normalized)
  const cached = readListCache(key)
  if (cached) return Promise.resolve(cached)

  const pending = readPending(key)
  if (pending) return pending

  const request = get(TIP_ENDPOINT, { params: normalized })
    .then((data) => writeListCache(key, data))
    .finally(() => clearPending(key))
  writePending(key, request)
  return request
}

export const fetchTipPost = (id) =>
  get(`${TIP_ENDPOINT}/${id}`)

export const increaseTipView = (id) =>
  post(`${TIP_ENDPOINT}/${id}/view`)

const buildTipRequest = ({ guestName, guestPassword, title, content, notice }) => ({
  title,
  content,
  guestName,
  guestPassword,
  notice,
})

export const createTipPost = ({ guestName, guestPassword, title, content, notice, file }) => {
  const requestBody = buildTipRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return post(TIP_ENDPOINT, requestBody).then((data) => {
      invalidateTipListCache()
      return data
    })
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return post(TIP_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((data) => {
    invalidateTipListCache()
    return data
  })
}

export const updateTipPost = (id, { guestName, guestPassword, title, content, notice, file }) => {
  const requestBody = buildTipRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return put(`${TIP_ENDPOINT}/${id}`, requestBody).then((data) => {
      invalidateTipListCache()
      return data
    })
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return put(`${TIP_ENDPOINT}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((data) => {
    invalidateTipListCache()
    return data
  })
}

export const deleteTipPost = (id, params) => {
  if (!params) {
    return del(`${TIP_ENDPOINT}/${id}`).then((data) => {
      invalidateTipListCache()
      return data
    })
  }
  return del(`${TIP_ENDPOINT}/${id}`, {
    params: {
      guestName: params.guestName,
      guestPassword: params.guestPassword,
    },
  }).then((data) => {
    invalidateTipListCache()
    return data
  })
}
