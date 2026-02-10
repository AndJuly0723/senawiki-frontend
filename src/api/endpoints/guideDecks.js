import apiClient from '../client'

export const GUIDE_DECKS_ENDPOINT = '/api/guide-decks'

export const fetchGuideDecks = (params = {}) =>
  apiClient.get(GUIDE_DECKS_ENDPOINT, { params }).then((response) => response.data)

export const fetchGuideDeckEquipment = (deckId, heroId) =>
  apiClient
    .get(`${GUIDE_DECKS_ENDPOINT}/${deckId}/equipment`, {
      params: heroId ? { heroId } : undefined,
    })
    .then((response) => response.data)

export const createGuideDeck = (payload) =>
  apiClient.post('/api/deck_create', payload).then((response) => response.data)

export const updateGuideDeck = (deckId, payload) =>
  apiClient.put(`${GUIDE_DECKS_ENDPOINT}/${deckId}`, payload).then((response) => response.data)

export const deleteGuideDeck = (deckId) =>
  apiClient.delete(`${GUIDE_DECKS_ENDPOINT}/${deckId}`).then((response) => response.data)

export const voteGuideDeck = (deckId, voteType) =>
  apiClient
    .post(`${GUIDE_DECKS_ENDPOINT}/${deckId}/votes`, { voteType })
    .then((response) => response.data)
