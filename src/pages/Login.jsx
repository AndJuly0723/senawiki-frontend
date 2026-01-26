import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/endpoints/auth'
import { setAuthTokens, setStoredUser } from '../utils/authStorage'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
      navigate('/')
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '로그인에 실패했습니다.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <button
          className="auth-close"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="닫기"
        >
          ✕
        </button>
        <h1>로그인</h1>
        <p>이메일과 비밀번호를 입력하세요.</p>
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
          아직 계정이 없나요? <Link to="/register">회원가입</Link>
        </div>
      </div>
    </section>
  )
}

export default Login
