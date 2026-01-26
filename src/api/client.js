import axios from 'axios'
import { getAccessToken, getRefreshToken, setAuthTokens } from '../utils/authStorage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers = config.headers ?? {}
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    if (status !== 401) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post('/api/auth/refresh', { refreshToken })
        .then((response) => {
          const data = response.data
          if (data?.accessToken && data?.refreshToken) {
            setAuthTokens(data.accessToken, data.refreshToken)
          }
          return data
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const data = await refreshPromise
      if (!data?.accessToken) {
        return Promise.reject(error)
      }
      originalRequest._retry = true
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export default apiClient
