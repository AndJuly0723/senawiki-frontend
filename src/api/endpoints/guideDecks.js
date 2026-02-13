import apiClient from '../client'

export const GUIDE_DECKS_ENDPOINT = '/api/guide-decks'

const LIST_CACHE_TTL_MS = 60 * 1000
const EQUIPMENT_CACHE_TTL_MS = 60 * 1000

const listCache = new Map()
const equipmentCache = new Map()

const now = () => Date.now()

const normalizeParams = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value != null && value !== '')
  entries.sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries)
}

const makeListKey = (params = {}) => JSON.stringify(normalizeParams(params))
const makeEquipmentKey = (deckId, heroId) => `${deckId}::${heroId ?? ''}`

const readCache = (store, key) => {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now()) {
    store.delete(key)
    return null
  }
  return entry.value
}

const readPending = (store, key) => {
  const entry = store.get(key)
  return entry?.pending ?? null
}

const writePending = (store, key, pending, ttlMs) => {
  const entry = store.get(key) ?? { value: null, expiresAt: 0, pending: null }
  entry.pending = pending
  entry.expiresAt = now() + ttlMs
  store.set(key, entry)
}

const writeValue = (store, key, value, ttlMs) => {
  const entry = store.get(key) ?? { value: null, expiresAt: 0, pending: null }
  entry.value = value
  entry.pending = null
  entry.expiresAt = now() + ttlMs
  store.set(key, entry)
  return value
}

const clearPending = (store, key) => {
  const entry = store.get(key)
  if (!entry) return
  entry.pending = null
  store.set(key, entry)
}

const invalidateGuideDeckCaches = () => {
  listCache.clear()
  equipmentCache.clear()
}

export const fetchGuideDecks = (params = {}) => {
  const normalized = normalizeParams(params)
  const key = makeListKey(normalized)
  const cached = readCache(listCache, key)
  if (cached) return Promise.resolve(cached)

  const pending = readPending(listCache, key)
  if (pending) return pending

  const request = apiClient
    .get(GUIDE_DECKS_ENDPOINT, { params: normalized })
    .then((response) => writeValue(listCache, key, response.data, LIST_CACHE_TTL_MS))
    .finally(() => clearPending(listCache, key))
  writePending(listCache, key, request, LIST_CACHE_TTL_MS)
  return request
}

export const fetchGuideDeckEquipment = (deckId, heroId) => {
  const key = makeEquipmentKey(deckId, heroId)
  const cached = readCache(equipmentCache, key)
  if (cached) return Promise.resolve(cached)

  const pending = readPending(equipmentCache, key)
  if (pending) return pending

  const request = apiClient
    .get(`${GUIDE_DECKS_ENDPOINT}/${deckId}/equipment`, {
      params: heroId ? { heroId } : undefined,
    })
    .then((response) => writeValue(equipmentCache, key, response.data, EQUIPMENT_CACHE_TTL_MS))
    .finally(() => clearPending(equipmentCache, key))
  writePending(equipmentCache, key, request, EQUIPMENT_CACHE_TTL_MS)
  return request
}

export const createGuideDeck = (payload) =>
  apiClient.post('/api/deck_create', payload).then((response) => {
    invalidateGuideDeckCaches()
    return response.data
  })

export const updateGuideDeck = (deckId, payload) =>
  apiClient.put(`${GUIDE_DECKS_ENDPOINT}/${deckId}`, payload).then((response) => {
    invalidateGuideDeckCaches()
    return response.data
  })

export const deleteGuideDeck = (deckId) =>
  apiClient.delete(`${GUIDE_DECKS_ENDPOINT}/${deckId}`).then((response) => {
    invalidateGuideDeckCaches()
    return response.data
  })

export const voteGuideDeck = (deckId, voteType) =>
  apiClient
    .post(`${GUIDE_DECKS_ENDPOINT}/${deckId}/votes`, { voteType })
    .then((response) => {
      invalidateGuideDeckCaches()
      return response.data
    })
