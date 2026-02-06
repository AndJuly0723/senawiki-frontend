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
