import { get, post, put, del } from '../request'

export const COMMUNITY_ENDPOINT = '/api/community'

export const fetchCommunityPosts = (params = {}) =>
  get(COMMUNITY_ENDPOINT, { params })

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
    return post(COMMUNITY_ENDPOINT, requestBody)
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return post(COMMUNITY_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateCommunityPost = (
  id,
  { guestName, guestPassword, title, content, notice, file },
) => {
  const requestBody = buildCommunityRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return put(`${COMMUNITY_ENDPOINT}/${id}`, requestBody)
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return put(`${COMMUNITY_ENDPOINT}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteCommunityPost = (id, params) => {
  if (!params) {
    return del(`${COMMUNITY_ENDPOINT}/${id}`)
  }
  return del(`${COMMUNITY_ENDPOINT}/${id}`, {
    params: {
      guestName: params.guestName,
      guestPassword: params.guestPassword,
    },
  })
}
