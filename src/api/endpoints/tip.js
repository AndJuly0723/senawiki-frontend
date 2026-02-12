import { get, post, put, del } from '../request'

export const TIP_ENDPOINT = '/api/tip'

export const fetchTipPosts = (params = {}) =>
  get(TIP_ENDPOINT, { params })

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
    return post(TIP_ENDPOINT, requestBody)
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return post(TIP_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateTipPost = (id, { guestName, guestPassword, title, content, notice, file }) => {
  const requestBody = buildTipRequest({ guestName, guestPassword, title, content, notice })
  if (!file) {
    return put(`${TIP_ENDPOINT}/${id}`, requestBody)
  }

  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(requestBody)], { type: 'application/json' }),
  )
  formData.append('file', file)

  return put(`${TIP_ENDPOINT}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteTipPost = (id, params) => {
  if (!params) {
    return del(`${TIP_ENDPOINT}/${id}`)
  }
  return del(`${TIP_ENDPOINT}/${id}`, {
    params: {
      guestName: params.guestName,
      guestPassword: params.guestPassword,
    },
  })
}