import apiClient from './client'

export async function request(config) {
  const response = await apiClient(config)
  return response.data
}

export const get = (url, config = {}) =>
  request({ ...config, method: 'get', url })

export const post = (url, data, config = {}) =>
  request({ ...config, method: 'post', url, data })

export const put = (url, data, config = {}) =>
  request({ ...config, method: 'put', url, data })

export const del = (url, config = {}) =>
  request({ ...config, method: 'delete', url })
