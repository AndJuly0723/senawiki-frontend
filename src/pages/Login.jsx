import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/endpoints/auth'
import { setAuthTokens, setStoredUser } from '../utils/authStorage'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const backgroundLocation = location.state?.backgroundLocation
  const returnTo =
    typeof location.state?.from === 'string' && location.state.from
      ? location.state.from
      : '/'

  const handleClose = () => {
    navigate(returnTo, { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await loginUser({ email: email.trim(), password })
      if (data?.accessToken && data?.refreshToken) {
        setAuthTokens(data.accessToken, data.refreshToken)
      }
      if (data?.user) {
        setStoredUser(data.user)
      }
      setStatus('success')
      navigate(returnTo, { replace: true })
    } catch (error) {
      const statusCode = error?.response?.status
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        ''
      const normalizedMessage = String(backendMessage).toLowerCase()

      let message = '로그인에 실패했습니다.'
      if (
        statusCode === 404 ||
        normalizedMessage.includes('user not found') ||
        normalizedMessage.includes('no such user') ||
        normalizedMessage.includes('존재하지') ||
        normalizedMessage.includes('회원정보가 없')
      ) {
        message = '등록된 회원정보가 없습니다.'
      } else if (
        statusCode === 401 ||
        normalizedMessage.includes('bad credentials') ||
        normalizedMessage.includes('credential') ||
        normalizedMessage.includes('password') ||
        normalizedMessage.includes('비밀번호') ||
        normalizedMessage.includes('자격증명')
      ) {
        message = '비밀번호가 틀렸습니다.'
      } else if (backendMessage) {
        message = backendMessage
      }

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <section className="auth-page" role="dialog" aria-modal="true">
      <div className="auth-card">
        <button className="auth-close" type="button" onClick={handleClose} aria-label="닫기">
          ×
        </button>
        <h1>로그인</h1>
        <p>이메일과 비밀번호를 입력해주세요.</p>
        <form onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="test@example.com"
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호"
              required
            />
          </label>
          {status === 'error' ? (
            <div className="auth-error" role="alert">
              {errorMessage}
            </div>
          ) : null}
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="auth-footer">
          아직 계정이 없나요? <Link to="/register" state={{ from: returnTo, backgroundLocation }}>회원가입</Link>
        </div>
      </div>
    </section>
  )
}

export default Login
