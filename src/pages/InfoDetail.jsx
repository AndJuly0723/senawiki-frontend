import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteTipPost,
  fetchTipPost,
  increaseTipView,
} from '../api/endpoints/tip'
import { getStoredUser, isAdminUser } from '../utils/authStorage'

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function InfoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('delete')
  const [guestName, setGuestName] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [actionError, setActionError] = useState('')
  const isAdmin = isAdminUser(getStoredUser())

  useEffect(() => {
    let isActive = true

    const loadPost = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        increaseTipView(id).catch(() => {})
        const data = await fetchTipPost(id)
        if (isActive) {
          setPost(data)
          setStatus('success')
        }
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

  const isGuest = post?.authorType === 'GUEST'
  const isNotice = Boolean(post?.notice)
  const createdAt = useMemo(() => formatDateTime(post?.createdAt), [post?.createdAt])
  const fileUrl = post?.fileDownloadUrl
  const isImage = post?.fileContentType?.startsWith('image/')

  const openModal = (mode) => {
    setModalMode(mode)
    setModalOpen(true)
    setActionError('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setGuestPassword('')
    setActionError('')
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteTipPost(
        id,
        isAdmin
          ? null
          : {
              guestName: guestName.trim(),
              guestPassword,
            },
      )
      navigate('/info')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '삭제에 실패했습니다.'
      setActionError(message)
    }
  }

  const handleConfirm = async () => {
    if (modalMode === 'delete') {
      await handleDelete()
      return
    }
    navigate(`/info/${id}/edit`, {
      state: {
        guestName: guestName.trim(),
        guestPassword,
      },
    })
  }

  const renderActionMenu = () => (
    <div className="community-detail-actions">
      <button
        className="community-action-button"
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="게시글 작업"
      >
        <span className="community-action-dot" />
        <span className="community-action-dot" />
        <span className="community-action-dot" />
      </button>
      {menuOpen ? (
        <div className="community-action-menu" role="menu">
          {(!isNotice || isAdmin) && (
            <button
              className="community-action-item"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                if (isGuest && !isAdmin) {
                  openModal('edit')
                } else {
                  navigate(`/info/${id}/edit`)
                }
              }}
            >
              수정
            </button>
          )}
          {(!isNotice || isAdmin) && (
            <button
              className="community-action-item community-action-item--danger"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                if (isGuest && !isAdmin) {
                  openModal('delete')
                } else {
                  handleDelete()
                }
              }}
            >
              삭제
            </button>
          )}
        </div>
      ) : null}
    </div>
  )

  return (
    <section className="community-detail">
      <div className="community-detail-header">
        <div>
          <div className="community-detail-title">
            {status === 'loading' ? '불러오는 중...' : post?.title || '제목 없음'}
          </div>
          <div className="community-detail-meta">
            <span>{post?.authorName ?? '-'}</span>
            <span>조회 {post?.viewCount ?? 0}</span>
            <span>{createdAt}</span>
          </div>
        </div>
        <div className="community-detail-header-actions">
          <Link className="community-back community-back--compact" to="/info">
            목록으로
          </Link>
          {status === 'success' ? renderActionMenu() : null}
        </div>
      </div>

      {status === 'error' ? (
        <div className="community-detail-error">{errorMessage}</div>
      ) : null}

      {status === 'success' ? (
        <div className="community-detail-body">
          <div className="community-detail-content">
            {post?.content?.split('\n').map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
          {fileUrl ? (
            <div className="community-detail-file">
              <span className="community-detail-file-label">첨부파일</span>
              {isImage ? (
                <img src={fileUrl} alt={post?.fileOriginalName ?? '첨부 이미지'} />
              ) : (
                <a href={fileUrl}>{post?.fileOriginalName ?? '파일 다운로드'}</a>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="community-comments">
        <div className="community-comments-header">
          댓글 <span className="community-comments-count">0</span>
        </div>
        <div className="community-comments-empty">등록된 댓글이 없습니다.</div>
        <form className="community-comment-form">
          <textarea placeholder="댓글 내용을 입력해주세요" rows={4} disabled />
          <div className="community-comment-actions">
            <input type="text" placeholder="이름" disabled />
            <input type="password" placeholder="비밀번호" disabled />
            <button type="button" disabled>
              댓글등록
            </button>
          </div>
        </form>
      </div>

      {modalOpen ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button className="community-modal-backdrop" type="button" onClick={closeModal} />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <div>
                <h2>{modalMode === 'delete' ? '게시글 삭제' : '게시글 수정'}</h2>
                <p>비회원 비밀번호를 입력해주세요.</p>
              </div>
              <button
                className="community-modal-close"
                type="button"
                onClick={closeModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="community-modal-body">
              <label>
                이름
                <input
                  type="text"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="비회원명"
                />
              </label>
              <label>
                비밀번호
                <input
                  type="password"
                  value={guestPassword}
                  onChange={(event) => setGuestPassword(event.target.value)}
                  placeholder="비밀번호"
                />
              </label>
              {actionError ? (
                <div className="community-modal-error" role="alert">
                  {actionError}
                </div>
              ) : null}
            </div>
            <div className="community-modal-actions">
              <button className="community-modal-submit" type="button" onClick={handleConfirm}>
                확인
              </button>
              <button className="community-modal-cancel" type="button" onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default InfoDetail