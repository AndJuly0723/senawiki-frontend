import { post } from '../request'

export const registerUser = ({ name, nickname, email, password }) =>
  post('/api/auth/register', { name, nickname, email, password })

export const loginUser = ({ email, password }) =>
  post('/api/auth/login', { email, password })

export const refreshToken = ({ refreshToken: token }) =>
  post('/api/auth/refresh', { refreshToken: token })

export const logoutUser = ({ refreshToken }) =>
  post('/api/auth/logout', { refreshToken })

export const sendEmailVerification = ({ email }) =>
  post('/api/auth/email/send', { email })

export const verifyEmailCode = ({ email, code }) =>
  post('/api/auth/email/verify', { email, code })
