import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteTipPost,
  fetchTipPost,
  increaseTipView,
  updateTipPost,
} from '../api/endpoints/tip'
import {
  createBoardComment,
  deleteBoardComment,
  fetchBoardComments,
  updateBoardComment,
} from '../api/endpoints/boardComments'
import { getStoredUser, isAdminUser } from '../utils/authStorage'

const normalizeString = (value) => String(value ?? '').trim().toLowerCase()

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

const resolveFileUrl = (value) => {
  if (!value) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw
  }
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  if (!apiBase) return raw
  if (raw.startsWith('/')) return `${apiBase}${raw}`
  return `${apiBase}/${raw}`
}

function InfoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(getStoredUser())
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('delete')
  const [guestName] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [actionError, setActionError] = useState('')
  const [comments, setComments] = useState([])
  const [commentStatus, setCommentStatus] = useState('idle')
  const [commentError, setCommentError] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [commentGuestName, setCommentGuestName] = useState('')
  const [commentGuestPassword, setCommentGuestPassword] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentSubmitError, setCommentSubmitError] = useState('')
  const [commentMenuOpenId, setCommentMenuOpenId] = useState(null)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [commentModalMode, setCommentModalMode] = useState('delete')
  const [commentActionTarget, setCommentActionTarget] = useState(null)
  const [commentActionPassword, setCommentActionPassword] = useState('')
  const [commentActionContent, setCommentActionContent] = useState('')
  const [commentActionError, setCommentActionError] = useState('')
  const isAdmin = isAdminUser(currentUser)
  const isCommentGuest = !currentUser

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser())
    }
    window.addEventListener('authchange', handleAuthChange)
    return () => window.removeEventListener('authchange', handleAuthChange)
  }, [])

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

  const loadComments = useCallback(async (isActiveRef) => {
    setCommentStatus('loading')
    setCommentError('')
    try {
      const data = await fetchBoardComments('TIP', id)
      const list = Array.isArray(data)
        ? data
        : data?.content ?? data?.items ?? data?.data ?? []
      const normalized = list.map((comment, index) => ({
        id: comment.id ?? comment.commentId ?? comment._id ?? 'comment-' + index,
        author:
          comment.authorName ??
          comment.authorNickname ??
          comment.nickname ??
          comment.writer ??
          comment.name ??
          comment.email ??
          '익명',
        content: comment.content ?? comment.comment ?? comment.body ?? '',
        createdAt: comment.createdAt ?? comment.created_at ?? comment.date,
        authorType: comment.authorType ?? comment.writerType ?? comment.userType,
        raw: comment,
      }))
      if (!isActiveRef || isActiveRef.current) {
        setComments(normalized)
        setCommentStatus('success')
      }
    } catch (error) {
      if (!isActiveRef || isActiveRef.current) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          '댓글을 불러오지 못했습니다.'
        setCommentError(message)
        setCommentStatus('error')
      }
    }
  }, [id])

  useEffect(() => {
    const isActiveRef = { current: true }
    loadComments(isActiveRef)
    return () => {
      isActiveRef.current = false
    }
  }, [loadComments])

  const isGuest = post?.authorType === 'GUEST'
  const isNotice = Boolean(post?.notice)
  const userTokens = [
    currentUser?.id,
    currentUser?.userId,
    currentUser?.memberId,
    currentUser?.email,
    currentUser?.nickname,
    currentUser?.name,
    currentUser?.username,
    currentUser?.loginId,
  ]
    .map(normalizeString)
    .filter(Boolean)
  const postTokens = [
    post?.authorId,
    post?.userId,
    post?.memberId,
    post?.authorName,
    post?.authorNickname,
    post?.nickname,
    post?.writer,
    post?.name,
    post?.email,
    post?.author,
  ]
    .map(normalizeString)
    .filter(Boolean)
  const isPostOwner =
    Boolean(currentUser) &&
    userTokens.some((token) => postTokens.includes(token)) &&
    postTokens.length > 0
  const canManageComment = useCallback(
    (comment) => {
      if (!comment) return false
      if (isAdmin) return true
      if (comment?.raw?.canEdit === true || comment?.raw?.editable === true || comment?.raw?.isOwner === true) {
        return true
      }
      if (!currentUser) {
        return normalizeString(comment.authorType) === 'guest'
      }
      // Some API responses omit stable author identifiers for member comments.
      // In that case, keep actions visible for logged-in users and rely on server-side permission checks.
      const normalizedAuthorType = normalizeString(comment.authorType)
      if (normalizedAuthorType && normalizedAuthorType !== 'guest') {
        return true
      }
      const commentTokens = [
        comment?.raw?.authorId,
        comment?.raw?.userId,
        comment?.raw?.memberId,
        comment?.raw?.authorName,
        comment?.raw?.authorNickname,
        comment?.raw?.nickname,
        comment?.raw?.writer,
        comment?.raw?.name,
        comment?.raw?.email,
        comment?.raw?.author,
        comment?.author,
      ]
        .map(normalizeString)
        .filter(Boolean)
      if (commentTokens.length === 0) {
        return true
      }
      return userTokens.some((token) => commentTokens.includes(token))
    },
    [currentUser, isAdmin, userTokens],
  )
  const canManagePost = isAdmin || isGuest || isPostOwner
  const canShowPostActionMenu = isNotice ? isAdmin : canManagePost
  const createdAt = useMemo(() => formatDateTime(post?.createdAt), [post?.createdAt])
  const fileUrl = resolveFileUrl(post?.fileDownloadUrl)
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
    if (!(isNotice ? isAdmin : canManagePost)) return
    setActionError('')
    if (!isAdmin && !guestPassword) {
      setActionError('비밀번호를 입력해주세요.')
      return
    }
    try {
      await deleteTipPost(
        id,
        isAdmin
          ? null
          : {
              guestName: post?.authorName ?? guestName.trim(),
              guestPassword,
            },
      )
      navigate('/info')
    } catch (error) {
      if (error?.response?.status === 401) {
        setActionError('잘못된 비밀번호 입니다.')
        return
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '삭제에 실패했습니다.'
      setActionError(message)
    }
  }

  const handleConfirm = async () => {
    if (!(isNotice ? isAdmin : canManagePost)) return
    if (modalMode === 'delete') {
      await handleDelete()
      return
    }
    if (isGuest && !isAdmin) {
      if (!guestPassword) {
        setActionError('비밀번호를 입력해주세요.')
        return
      }
      setActionError('')
      try {
        await updateTipPost(id, {
          guestName: post?.authorName ?? guestName.trim(),
          guestPassword,
          title: post?.title ?? '',
          content: post?.content ?? '',
        })
      } catch (error) {
        if (error?.response?.status === 401) {
          setActionError('잘못된 비밀번호 입니다.')
          return
        }
        const message =
          error?.response?.data?.message ||
          error?.message ||
          '수정에 실패했습니다.'
        setActionError(message)
        return
      }
    }
    navigate(`/info/${id}/edit`, {
      state: {
        guestName: post?.authorName ?? guestName.trim(),
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

  const openCommentModal = (mode, comment) => {
    setCommentModalMode(mode)
    setCommentActionTarget(comment)
    setCommentActionContent(comment?.content ?? '')
    setCommentActionPassword('')
    setCommentActionError('')
    setCommentModalOpen(true)
  }

  const closeCommentModal = () => {
    setCommentModalOpen(false)
    setCommentActionTarget(null)
    setCommentActionContent('')
    setCommentActionPassword('')
    setCommentActionError('')
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const trimmedContent = commentContent.trim()
    if (!trimmedContent) return
    if (isCommentGuest && (!commentGuestName.trim() || !commentGuestPassword)) {
      setCommentSubmitError('이름과 비밀번호를 입력해주세요.')
      return
    }

    setCommentSubmitting(true)
    setCommentSubmitError('')
    try {
      await createBoardComment('TIP', id, {
        content: trimmedContent,
        guestName: isCommentGuest ? commentGuestName.trim() : undefined,
        guestPassword: isCommentGuest ? commentGuestPassword : undefined,
      })
      setCommentContent('')
      if (isCommentGuest) {
        setCommentGuestPassword('')
      }
      await loadComments()
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '댓글 등록에 실패했습니다.'
      setCommentSubmitError(message)
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleCommentAction = async () => {
    if (!commentActionTarget) return
    if (!canManageComment(commentActionTarget)) {
      setCommentActionError('권한이 없습니다.')
      return
    }
    if (isCommentGuest && !commentActionPassword) {
      setCommentActionError('비밀번호를 입력해주세요.')
      return
    }

    try {
      if (commentModalMode === 'edit') {
        const trimmed = commentActionContent.trim()
        if (!trimmed) {
          setCommentActionError('댓글 내용을 입력해주세요.')
          return
        }
        await updateBoardComment('TIP', id, commentActionTarget.id, {
          content: trimmed,
          guestName: isCommentGuest ? commentActionTarget?.author?.trim() : undefined,
          guestPassword: isCommentGuest ? commentActionPassword : undefined,
        })
      } else {
        await deleteBoardComment('TIP', id, commentActionTarget.id, {
          guestName: isCommentGuest ? commentActionTarget?.author?.trim() : undefined,
          guestPassword: isCommentGuest ? commentActionPassword : undefined,
        })
      }
      closeCommentModal()
      await loadComments()
    } catch (error) {
      if (error?.response?.status === 401) {
        setCommentActionError('잘못된 비밀번호 입니다.')
        return
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        (commentModalMode === 'edit' ? '댓글 수정에 실패했습니다.' : '댓글 삭제에 실패했습니다.')
      setCommentActionError(message)
    }
  }

  return (
    <section className="community-detail">
      <div className="community-detail-header">
        <div>
          <div className="community-detail-breadcrumb">커뮤니티 &gt; 정보&팁</div>
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
          {status === 'success' && canShowPostActionMenu ? renderActionMenu() : null}
        </div>
      </div>

      {status === 'error' ? (
        <div className="community-detail-error">{errorMessage}</div>
      ) : null}

      {status === 'success' ? (
        <div className="community-detail-body">
          <div className="community-detail-content">
            <p className="community-detail-text">{post?.content ?? ''}</p>
            {fileUrl && isImage ? (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="community-detail-image-link">
                <img
                  className="community-detail-inline-image"
                  src={fileUrl}
                  alt={post?.fileOriginalName ?? '첨부 이미지'}
                />
              </a>
            ) : null}
          </div>
          {fileUrl && !isImage ? (
            <div className="community-detail-file">
              <span className="community-detail-file-label">첨부파일</span>
              <a href={fileUrl}>{post?.fileOriginalName ?? '파일 다운로드'}</a>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="community-comments">
        <div className="community-comments-header">
          댓글 <span className="community-comments-count">{comments.length}</span>
        </div>
        {commentStatus === 'loading' ? (
          <div className="community-comments-empty">댓글을 불러오는 중...</div>
        ) : null}
        {commentStatus === 'error' ? (
          <div className="community-comments-empty">{commentError}</div>
        ) : null}
        {commentStatus === 'success' && comments.length === 0 ? (
          <div className="community-comments-empty">등록된 댓글이 없습니다.</div>
        ) : null}
        {comments.length > 0 ? (
          <div className="community-comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="community-comment">
                <div className="community-comment-head">
                  <div className="community-comment-head-main">
                    <strong className="community-comment-author">{comment.author}</strong>
                    <span className="community-comment-date">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  {canManageComment(comment) ? (
                    <div className="community-comment-actions-menu">
                      <button
                        className="community-comment-action-button"
                        type="button"
                        aria-label="댓글 작업"
                        onClick={() =>
                          setCommentMenuOpenId((prev) => (prev === comment.id ? null : comment.id))
                        }
                      >
                        <span className="community-comment-action-dot" />
                        <span className="community-comment-action-dot" />
                        <span className="community-comment-action-dot" />
                      </button>
                      {commentMenuOpenId === comment.id ? (
                        <div className="community-comment-action-menu" role="menu">
                          <button
                            className="community-comment-action-item"
                            type="button"
                            onClick={() => {
                              setCommentMenuOpenId(null)
                              openCommentModal('edit', comment)
                            }}
                          >
                            수정
                          </button>
                          <button
                            className="community-comment-action-item community-comment-action-item--danger"
                            type="button"
                            onClick={() => {
                              setCommentMenuOpenId(null)
                              openCommentModal('delete', comment)
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <p className="community-comment-body">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : null}
        <form className="community-comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            placeholder="댓글 내용을 입력해주세요"
            rows={4}
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            disabled={commentSubmitting}
          />
          <div className="community-comment-actions">
            {isCommentGuest ? (
              <>
                <input
                  type="text"
                  placeholder="이름"
                  value={commentGuestName}
                  onChange={(event) => setCommentGuestName(event.target.value)}
                  disabled={commentSubmitting}
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={commentGuestPassword}
                  onChange={(event) => setCommentGuestPassword(event.target.value)}
                  disabled={commentSubmitting}
                  required
                />
              </>
            ) : null}
            <button
              type="submit"
              disabled={
                commentSubmitting ||
                !commentContent.trim() ||
                (isCommentGuest && (!commentGuestName.trim() || !commentGuestPassword))
              }
            >
              {commentSubmitting ? '등록 중...' : '댓글등록'}
            </button>
          </div>
          {commentSubmitError ? (
            <div className="community-comments-empty">{commentSubmitError}</div>
          ) : null}
        </form>
      </div>

      {modalOpen ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button className="community-modal-backdrop" type="button" onClick={closeModal} />
          <div className="community-modal-card">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleConfirm()
              }}
            >
              <div className="community-modal-header">
                <div>
                  <h2>{modalMode === 'delete' ? '게시글 삭제' : '게시글 수정'}</h2>
                  <p>비회원 비밀번호를 입력해주세요.</p>
                </div>
              </div>
              <div className="community-modal-body">
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
                <button className="community-modal-submit" type="submit">
                  확인
                </button>
                <button className="community-modal-cancel" type="button" onClick={closeModal}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {commentModalOpen ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button className="community-modal-backdrop" type="button" onClick={closeCommentModal} />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <div>
                <h2>{commentModalMode === 'edit' ? '댓글 수정' : '댓글 삭제'}</h2>
                <p>
                  {commentModalMode === 'edit'
                    ? '댓글 내용을 수정해주세요.'
                    : !isCommentGuest
                      ? '댓글을 삭제하시겠습니까?'
                      : '댓글을 삭제하려면 비밀번호를 입력해주세요.'}
                </p>
              </div>
            </div>
            <div className="community-modal-body">
              {commentModalMode === 'edit' ? (
                <label>
                  댓글 내용
                  <textarea
                    value={commentActionContent}
                    onChange={(event) => setCommentActionContent(event.target.value)}
                    rows={4}
                  />
                </label>
              ) : null}
              {isCommentGuest ? (
                <label>
                  비밀번호
                  <input
                    type="password"
                    value={commentActionPassword}
                    onChange={(event) => setCommentActionPassword(event.target.value)}
                    placeholder="비밀번호"
                  />
                </label>
              ) : null}
              {commentActionError ? (
                <div className="community-modal-error" role="alert">
                  {commentActionError}
                </div>
              ) : null}
            </div>
            <div className="community-modal-actions">
              <button className="community-modal-submit" type="button" onClick={handleCommentAction}>
                {commentModalMode === 'edit' ? '수정' : '삭제'}
              </button>
              <button className="community-modal-cancel" type="button" onClick={closeCommentModal}>
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






