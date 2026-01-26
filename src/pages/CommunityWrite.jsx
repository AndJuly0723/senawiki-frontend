import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCommunityPost } from '../api/endpoints/community'
import { getStoredUser, isAdminUser } from '../utils/authStorage'

function CommunityWrite() {
  const navigate = useNavigate()
  const [guestName, setGuestName] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [notice, setNotice] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(getStoredUser())
  const isAdmin = isAdminUser(currentUser)
  const isGuest = !currentUser

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser())
    }
    window.addEventListener('authchange', handleAuthChange)
    return () => window.removeEventListener('authchange', handleAuthChange)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      await createCommunityPost({
        guestName: isGuest ? guestName.trim() : undefined,
        guestPassword: isGuest ? guestPassword : undefined,
        title: title.trim(),
        content: content.trim(),
        notice: isAdmin ? notice : undefined,
        file: attachment,
      })
      setStatus('success')
      navigate('/community')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '글 작성에 실패했습니다.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <section className="community-write">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>글 작성</h1>
          <p>
            {isGuest
              ? '비회원은 이름과 비밀번호를 입력해야 합니다.'
              : '회원은 바로 글을 작성할 수 있습니다.'}
          </p>
        </div>
        <div className="community-actions">
          <Link className="community-icon-button" to="/community" aria-label="목록으로">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="community-write-card">
        <form className="community-form" onSubmit={handleSubmit}>
          {isGuest ? (
            <div className="community-form-grid">
              <label className="community-form-field">
                <span className="community-form-label">이름</span>
                <input
                  className="community-form-input"
                  type="text"
                  placeholder="비회원 이름"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                />
              </label>
              <label className="community-form-field">
                <span className="community-form-label">비밀번호</span>
                <input
                  className="community-form-input"
                  type="password"
                  placeholder="글 수정/삭제용 비밀번호"
                  value={guestPassword}
                  onChange={(event) => setGuestPassword(event.target.value)}
                  required
                />
              </label>
            </div>
          ) : null}

          <label className="community-form-field">
            <span className="community-form-label">제목</span>
            <input
              className="community-form-input"
              type="text"
              placeholder="제목을 입력하세요."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="community-form-field">
            <span className="community-form-label">내용</span>
            <textarea
              className="community-form-textarea"
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              required
            />
          </label>

          {isAdmin ? (
            <label className="community-form-field community-form-checkbox">
              <input
                type="checkbox"
                checked={notice}
                onChange={(event) => setNotice(event.target.checked)}
              />
              <span>공지글로 등록</span>
            </label>
          ) : null}

          <div className="community-form-field">
            <span className="community-form-label">첨부파일</span>
            <div className="community-file-upload">
              <label className="community-file-button">
                파일 선택
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setAttachment(file)
                  }}
                />
              </label>
              <span className="community-file-name">
                {attachment ? attachment.name : '선택된 파일이 없습니다.'}
              </span>
            </div>
          </div>

          {status === 'error' ? (
            <div className="community-form-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <div className="community-form-actions">
            <button className="community-submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? '등록 중...' : '등록'}
            </button>
            <Link className="community-cancel" to="/community">
              취소
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CommunityWrite
