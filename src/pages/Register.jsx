import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { registerUser, sendEmailVerification, verifyEmailCode } from '../api/endpoints/auth'
import { setAuthTokens, setStoredUser } from '../utils/authStorage'

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState('idle')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const backgroundLocation = location.state?.backgroundLocation
  const returnTo =
    typeof location.state?.from === 'string' && location.state.from
      ? location.state.from
      : '/'
  const canSubmit = status !== 'loading' && emailVerified && agreedToTerms && agreedToPrivacy

  const handleClose = () => {
    navigate(returnTo, { replace: true })
  }

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorMessage('이메일을 먼저 입력해주세요.')
      return
    }
    setVerifyStatus('sending')
    setErrorMessage('')
    try {
      await sendEmailVerification({ email: email.trim() })
      setVerifyStatus('sent')
      setEmailVerified(false)
      setTimerSeconds(300)
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '인증코드 전송에 실패했습니다.'
      setErrorMessage(message)
      setVerifyStatus('error')
    }
  }

  const handleVerifyCode = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      setErrorMessage('이메일과 인증코드를 입력해주세요.')
      return
    }
    setVerifyStatus('verifying')
    setErrorMessage('')
    try {
      await verifyEmailCode({
        email: email.trim(),
        code: verificationCode.trim(),
      })
      setEmailVerified(true)
      setVerifyStatus('verified')
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '인증코드 확인에 실패했습니다.'
      setErrorMessage(message)
      setVerifyStatus('error')
    }
  }

  const formatTimer = (value) => {
    const minutes = String(Math.floor(value / 60)).padStart(2, '0')
    const seconds = String(value % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  useEffect(() => {
    if (timerSeconds <= 0) return undefined
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [timerSeconds])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await registerUser({
        name: name.trim(),
        nickname: nickname.trim(),
        email: email.trim(),
        password,
      })
      if (data?.accessToken && data?.refreshToken) {
        setAuthTokens(data.accessToken, data.refreshToken)
      }
      if (data?.user) {
        setStoredUser(data.user)
      }
      setStatus('success')
      navigate(returnTo, { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '회원가입에 실패했습니다.'
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
        <h1>회원가입</h1>
        <p>기본 정보를 입력해 계정을 만들어주세요.</p>
        <form onSubmit={handleSubmit}>
          <label>
            이름
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="홍길동"
              required
            />
          </label>
          <label>
            닉네임
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="gildong"
              required
            />
          </label>
          <label>
            이메일
            <div className="auth-inline">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailVerified(false)
                }}
                placeholder="test@example.com"
                required
                disabled={verifyStatus === 'verifying' || verifyStatus === 'sending'}
              />
              <button
                className="auth-inline-button"
                type="button"
                onClick={handleSendCode}
                disabled={verifyStatus === 'sending' || timerSeconds > 0}
              >
                {timerSeconds > 0 ? `${formatTimer(timerSeconds)}` : '인증코드 전송'}
              </button>
            </div>
          </label>
          <label>
            인증코드
            <div className="auth-inline">
              <input
                type="text"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="6자리 코드"
                required
                disabled={emailVerified}
              />
              <button
                className="auth-inline-button"
                type="button"
                onClick={handleVerifyCode}
                disabled={emailVerified || verifyStatus === 'verifying'}
              >
                {emailVerified ? '인증완료' : '코드 확인'}
              </button>
            </div>
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="P@ssw0rd!"
              required
            />
          </label>
          <div className="auth-consent">
            <label className="auth-consent-item">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
              />
              <span>
                [필수] <Link to="/terms">이용약관</Link> 동의
              </span>
            </label>
            <label className="auth-consent-item">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(event) => setAgreedToPrivacy(event.target.checked)}
              />
              <span>
                [필수] <Link to="/privacy-policy">개인정보처리방침</Link> 동의
              </span>
            </label>
          </div>
          {status === 'error' || verifyStatus === 'error' ? (
            <div className="auth-error" role="alert">
              {errorMessage}
            </div>
          ) : null}
          {!emailVerified || !agreedToTerms || !agreedToPrivacy ? (
            <div className="auth-hint">이메일 인증 및 필수 약관 동의 후 회원가입이 가능합니다.</div>
          ) : null}
          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <div className="auth-footer">
          이미 계정이 있나요? <Link to="/login" state={{ from: returnTo, backgroundLocation }}>로그인</Link>
        </div>
      </div>
    </section>
  )
}

export default Register
