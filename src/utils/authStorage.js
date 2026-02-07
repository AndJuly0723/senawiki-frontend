const ACCESS_TOKEN_KEY = 'sena_access_token'
const REFRESH_TOKEN_KEY = 'sena_refresh_token'
const USER_KEY = 'sena_user'

const normalizeToken = (token) => {
  if (!token) return null
  if (token === 'null' || token === 'undefined') return null
  return token
}

export const getAccessToken = () => normalizeToken(localStorage.getItem(ACCESS_TOKEN_KEY))

export const getRefreshToken = () => normalizeToken(localStorage.getItem(REFRESH_TOKEN_KEY))

export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  window.dispatchEvent(new Event('authchange'))
}

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('authchange'))
}

export const setStoredUser = (user) => {
  if (!user) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('authchange'))
}

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const decodeJwtPayload = (token) => {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

const normalizeRole = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  if (typeof value === 'object') {
    const authority = value.authority ?? value.role
    return authority ? [authority] : []
  }
  return []
}

const extractRoles = (source) => {
  if (!source) return []
  if (source.role) return normalizeRole(source.role)
  if (source.roles) return normalizeRole(source.roles)
  if (source.authorities) {
    if (Array.isArray(source.authorities)) {
      return source.authorities.flatMap((entry) => normalizeRole(entry))
    }
    return normalizeRole(source.authorities)
  }
  if (source.authority) return normalizeRole(source.authority)
  return []
}

export const isAdminUser = (user) => {
  const userRoles = extractRoles(user)
  const tokenRoles = extractRoles(decodeJwtPayload(getAccessToken()))
  const roles = [...userRoles, ...tokenRoles]
  return roles.some((role) => String(role).toUpperCase().includes('ADMIN'))
}
