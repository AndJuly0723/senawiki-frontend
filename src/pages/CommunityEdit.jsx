import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchCommunityPost, updateCommunityPost } from '../api/endpoints/community'

function CommunityEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [guestName, setGuestName] = useState(location.state?.guestName ?? '')
  const [guestPassword, setGuestPassword] = useState(location.state?.guestPassword ?? '')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [authorType, setAuthorType] = useState('GUEST')
  const [fileOriginalName, setFileOriginalName] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    const loadPost = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const data = await fetchCommunityPost(id)
        if (!isActive) return
        setTitle(data?.title ?? '')
        setContent(data?.content ?? '')
        setAuthorType(data?.authorType ?? 'GUEST')
        setFileOriginalName(data?.fileOriginalName ?? '')
        setStatus('success')
      } catch (error) {
        if (isActive) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            '게시글을 불러오지 못했습니다.'
          setErrorMessage(message)
          setStatus('error')
        }
      }
    }

    loadPost()
    return () => {
      isActive = false
    }
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      await updateCommunityPost(id, {
        guestName: authorType === 'GUEST' ? guestName.trim() : undefined,
        guestPassword: authorType === 'GUEST' ? guestPassword : undefined,
        title: title.trim(),
        content: content.trim(),
        file: attachment,
      })
      setStatus('success')
      navigate(`/community/${id}`)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '수정에 실패했습니다.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <section className="community-write">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>글 수정</h1>
          <p>작성한 내용을 업데이트하세요.</p>
        </div>
        <div className="community-actions">
          <Link className="community-icon-button" to={`/community/${id}`} aria-label="상세로">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="community-write-card">
        <form className="community-form" onSubmit={handleSubmit}>
          {authorType === 'GUEST' ? (
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
                  placeholder="글 수정 비밀번호"
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
                {attachment
                  ? attachment.name
                  : fileOriginalName || '선택된 파일이 없습니다.'}
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
              {status === 'loading' ? '저장 중...' : '수정'}
            </button>
            <Link className="community-cancel" to={`/community/${id}`}>
              취소
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default CommunityEdit
