import axios from 'axios'
import { getAccessToken, getRefreshToken, setAuthTokens } from '../utils/authStorage'

const apiBaseURL = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
const timeoutFromEnv = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000)
const requestTimeout = Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0 ? timeoutFromEnv : 10000

if (import.meta.env.PROD && /(localhost|127\.0\.0\.1)/i.test(apiBaseURL)) {
  // Surface unsafe production API target early in browser logs.
  console.error('[API] VITE_API_BASE_URL points to localhost in production build.')
}

const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: requestTimeout,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  timeout: requestTimeout,
  withCredentials: false,
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

    const requestUrl = String(originalRequest.url ?? '')
    if (requestUrl.startsWith('/api/auth/')) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    if (status !== 401 && status !== 403) {
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
