import { get, post, put, del } from '../request'

export const COMMUNITY_ENDPOINT = '/api/community'

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

const invalidateCommunityListCache = () => {
  listCache.clear()
}

export const fetchCommunityPosts = (params = {}) => {
  const normalized = normalizeParams(params)
  const key = makeListKey(normalized)
  const cached = readListCache(key)
  if (cached) return Promise.resolve(cached)

  const pending = readPending(key)
  if (pending) return pending

  const request = get(COMMUNITY_ENDPOINT, { params: normalized })
    .then((data) => writeListCache(key, data))
    .finally(() => clearPending(key))
  writePending(key, request)
  return request
}

export const fetchCommunityPost = (id) =>
  get(`${COMMUNITY_ENDPOINT}/${id}`)

export const increaseCommunityView = (id) =>
  post(`${COMMUNITY_ENDPOINT}/${id}/view`)

const buildCommunityRequest = ({ guestName, guestPassword, title, content, notice }) => ({
  title,
  content,
  guestName,
  guestPassword,
  notice,
})

export const createCommunityPost = ({ guestName, guestPassword, title, content, notice, file }) => {
  const requestBody = buildCommunityRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return post(COMMUNITY_ENDPOINT, requestBody).then((data) => {
      invalidateCommunityListCache()
      return data
    })
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return post(COMMUNITY_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((data) => {
    invalidateCommunityListCache()
    return data
  })
}

export const updateCommunityPost = (
  id,
  { guestName, guestPassword, title, content, notice, file },
) => {
  const requestBody = buildCommunityRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return put(`${COMMUNITY_ENDPOINT}/${id}`, requestBody).then((data) => {
      invalidateCommunityListCache()
      return data
    })
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return put(`${COMMUNITY_ENDPOINT}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((data) => {
    invalidateCommunityListCache()
    return data
  })
}

export const deleteCommunityPost = (id, params) => {
  if (!params) {
    return del(`${COMMUNITY_ENDPOINT}/${id}`).then((data) => {
      invalidateCommunityListCache()
      return data
    })
  }
  return del(`${COMMUNITY_ENDPOINT}/${id}`, {
    params: {
      guestName: params.guestName,
      guestPassword: params.guestPassword,
    },
  }).then((data) => {
    invalidateCommunityListCache()
    return data
  })
}
