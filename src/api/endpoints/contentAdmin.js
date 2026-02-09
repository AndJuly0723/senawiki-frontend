import { del, get, post, put } from '../request'

const HEROES_ENDPOINT = '/api/heroes'
const PETS_ENDPOINT = '/api/pets'
const ADMIN_HEROES_ENDPOINT = '/api/admin/heroes'
const ADMIN_PETS_ENDPOINT = '/api/admin/pets'
const ADMIN_UPLOADS_ENDPOINT = '/api/admin/assets/upload'

export const fetchHeroes = () => get(HEROES_ENDPOINT)
export const fetchHero = (id) => get(`${HEROES_ENDPOINT}/${id}`)
export const fetchPets = () => get(PETS_ENDPOINT)
export const fetchPet = (id) => get(`${PETS_ENDPOINT}/${id}`)

export const createHero = (payload) => post(ADMIN_HEROES_ENDPOINT, payload)
export const updateHero = (id, payload) => put(`${ADMIN_HEROES_ENDPOINT}/${id}`, payload)
export const deleteHero = (id) => del(`${ADMIN_HEROES_ENDPOINT}/${id}`)

export const createPet = (payload) => post(ADMIN_PETS_ENDPOINT, payload)
export const updatePet = (id, payload) => put(`${ADMIN_PETS_ENDPOINT}/${id}`, payload)
export const deletePet = (id) => del(`${ADMIN_PETS_ENDPOINT}/${id}`)

export const uploadAdminFile = (file, type) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return post(ADMIN_UPLOADS_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
