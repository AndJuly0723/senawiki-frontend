import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCommunityPosts } from '../api/endpoints/community'
import { fetchTipPosts } from '../api/endpoints/tip'
import { fetchBoardComments } from '../api/endpoints/boardComments'
import { withdrawUser } from '../api/endpoints/auth'
import { clearAuth, getStoredUser } from '../utils/authStorage'

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

const extractList = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.content ?? payload?.items ?? payload?.data ?? []

const normalizeString = (value) => {
  const text = String(value ?? '').trim()
  return text ? text.toLowerCase() : ''
}

const toTokenSet = (...values) => {
  const set = new Set()
  values.forEach((value) => {
    const token = normalizeString(value)
    if (token) set.add(token)
  })
  return set
}

const matchesAny = (candidateSet, ...values) =>
  values.some((value) => candidateSet.has(normalizeString(value)))

const normalizePostItem = (boardType, post, index) => ({
  id: post.id ?? post.postId ?? post.communityId ?? post._id ?? `${boardType}-post-${index}`,
  boardType,
  title: post.title ?? post.subject ?? '제목 없음',
  createdAt: post.createdAt ?? post.created_at ?? post.date ?? null,
  raw: post,
})

const normalizeCommentItem = (boardType, post, comment, index) => ({
  id: comment.id ?? comment.commentId ?? comment._id ?? `${boardType}-${post.id}-comment-${index}`,
  boardType,
  postId: post.id,
  postTitle: post.title ?? post.subject ?? '제목 없음',
  content: comment.content ?? comment.comment ?? comment.body ?? '',
  createdAt: comment.createdAt ?? comment.created_at ?? comment.date ?? null,
  raw: comment,
})

const getPostLink = (boardType, postId) => (boardType === 'COMMUNITY' ? `/community/${postId}` : `/info/${postId}`)
const getBoardLabel = (boardType) => (boardType === 'COMMUNITY' ? '커뮤니티' : '정보&팁')

async function fetchAllPosts(fetcher, boardType) {
  const baseParams = { size: 50, sort: 'createdAt,desc' }
  const first = await fetcher({ page: 0, ...baseParams })
  const firstList = extractList(first).map((post, index) => normalizePostItem(boardType, post, index))
  if (Array.isArray(first)) return firstList

  const totalPages = Number.isFinite(first?.totalPages) ? first.totalPages : 1
  if (totalPages <= 1) return firstList

  const restPages = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 1)
  const rest = await Promise.allSettled(
    restPages.map((page) =>
      fetcher({ page, ...baseParams }).then((payload) =>
        extractList(payload).map((post, index) => normalizePostItem(boardType, post, index)),
      ),
    ),
  )

  return rest.reduce((acc, entry) => {
    if (entry.status === 'fulfilled') {
      return acc.concat(entry.value)
    }
    return acc
  }, firstList)
}

function MyPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [myPosts, setMyPosts] = useState([])
  const [myComments, setMyComments] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [withdrawStatus, setWithdrawStatus] = useState('idle')
  const [withdrawError, setWithdrawError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [navigate, user])

  useEffect(() => {
    if (!user) return undefined
    let active = true

    const loadMyActivity = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const [communityPosts, tipPosts] = await Promise.all([
          fetchAllPosts(fetchCommunityPosts, 'COMMUNITY'),
          fetchAllPosts(fetchTipPosts, 'TIP'),
        ])
        const allPosts = [...communityPosts, ...tipPosts]

        const userTokens = toTokenSet(
          user.id,
          user.userId,
          user.memberId,
          user.username,
          user.loginId,
          user.email,
          user.nickname,
          user.name,
        )

        const myPostList = allPosts
          .filter((post) =>
            matchesAny(
              userTokens,
              post.raw?.authorId,
              post.raw?.userId,
              post.raw?.memberId,
              post.raw?.authorName,
              post.raw?.authorNickname,
              post.raw?.nickname,
              post.raw?.writer,
              post.raw?.name,
              post.raw?.email,
            ),
          )
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

        const commentsResults = await Promise.allSettled(
          allPosts
            .filter((post) => post.id != null)
            .map(async (post) => {
              const data = await fetchBoardComments(post.boardType, post.id)
              const list = extractList(data)
              return list
                .map((comment, index) => normalizeCommentItem(post.boardType, post.raw, comment, index))
                .filter((comment) =>
                  matchesAny(
                    userTokens,
                    comment.raw?.authorId,
                    comment.raw?.userId,
                    comment.raw?.memberId,
                    comment.raw?.authorName,
                    comment.raw?.authorNickname,
                    comment.raw?.nickname,
                    comment.raw?.writer,
                    comment.raw?.name,
                    comment.raw?.email,
                  ),
                )
            }),
        )

        const myCommentList = commentsResults
          .reduce((acc, entry) => {
            if (entry.status === 'fulfilled') return acc.concat(entry.value)
            return acc
          }, [])
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

        if (!active) return
        setMyPosts(myPostList)
        setMyComments(myCommentList)
        setStatus('success')
      } catch (error) {
        if (!active) return
        const message =
          error?.response?.data?.message ||
          error?.message ||
          '마이페이지 정보를 불러오지 못했습니다.'
        setErrorMessage(message)
        setStatus('error')
      }
    }

    loadMyActivity()
    return () => {
      active = false
    }
  }, [user])

  const openWithdrawModal = () => {
    setWithdrawModalOpen(true)
    setWithdrawPassword('')
    setWithdrawError('')
    setWithdrawStatus('idle')
  }

  const closeWithdrawModal = () => {
    setWithdrawModalOpen(false)
    setWithdrawPassword('')
    setWithdrawError('')
    setWithdrawStatus('idle')
  }

  const handleWithdraw = async (event) => {
    event.preventDefault()
    if (!withdrawPassword) {
      setWithdrawError('비밀번호를 입력해주세요.')
      return
    }

    setWithdrawStatus('loading')
    setWithdrawError('')
    try {
      await withdrawUser({ password: withdrawPassword })
      clearAuth()
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        '회원탈퇴에 실패했습니다.'
      setWithdrawError(message)
      setWithdrawStatus('error')
    }
  }

  if (!user) return null

  return (
    <section className="my-page">
      <header className="my-page-header">
        <div>
          <h1>마이페이지</h1>
          <p>{user.nickname ?? user.name ?? '회원'}님의 활동 내역입니다.</p>
        </div>
        <div className="my-page-top-actions">
          <button type="button" className="my-page-withdraw-open" onClick={openWithdrawModal}>
            회원탈퇴
          </button>
        </div>
      </header>

      <div className="my-page-grid">
        <article className="my-page-card">
          <h2>내가 쓴 글</h2>
          {status === 'loading' ? <p className="my-page-empty">불러오는 중...</p> : null}
          {status === 'error' ? <p className="my-page-error">{errorMessage}</p> : null}
          {status === 'success' && myPosts.length === 0 ? (
            <p className="my-page-empty">작성한 글이 없습니다.</p>
          ) : null}
          {myPosts.length > 0 ? (
            <ul className="my-page-list">
              {myPosts.map((post) => (
                <li key={`${post.boardType}-${post.id}`} className="my-page-item">
                  <Link to={getPostLink(post.boardType, post.id)}>
                    [{getBoardLabel(post.boardType)}] {post.title}
                  </Link>
                  <span>{formatDateTime(post.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="my-page-card">
          <h2>내가 쓴 댓글</h2>
          {status === 'loading' ? <p className="my-page-empty">불러오는 중...</p> : null}
          {status === 'error' ? <p className="my-page-error">{errorMessage}</p> : null}
          {status === 'success' && myComments.length === 0 ? (
            <p className="my-page-empty">작성한 댓글이 없습니다.</p>
          ) : null}
          {myComments.length > 0 ? (
            <ul className="my-page-list">
              {myComments.map((comment) => (
                <li key={`${comment.boardType}-${comment.postId}-${comment.id}`} className="my-page-item">
                  <Link to={getPostLink(comment.boardType, comment.postId)}>
                    [{getBoardLabel(comment.boardType)}] {comment.postTitle}
                  </Link>
                  <p>{comment.content}</p>
                  <span>{formatDateTime(comment.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      </div>

      {withdrawModalOpen ? (
        <div className="my-page-modal" role="dialog" aria-modal="true" aria-label="회원탈퇴">
          <div className="my-page-modal-backdrop" />
          <div className="my-page-modal-card">
              <button
                type="button"
                className="auth-close my-page-modal-close"
                aria-label="닫기"
                onClick={closeWithdrawModal}
              >
                ×
            </button>
            <div className="my-page-modal-header">
              <h2>회원탈퇴</h2>
            </div>
            <p className="my-page-modal-desc">비밀번호를 입력한 뒤 회원탈퇴를 진행할 수 있습니다.</p>
            <form className="my-page-withdraw" onSubmit={handleWithdraw}>
              <input
                type="password"
                placeholder="비밀번호"
                value={withdrawPassword}
                onChange={(event) => setWithdrawPassword(event.target.value)}
                disabled={withdrawStatus === 'loading'}
                required
              />
              <button type="submit" disabled={withdrawStatus === 'loading' || !withdrawPassword}>
                {withdrawStatus === 'loading' ? '처리 중...' : '회원탈퇴'}
              </button>
            </form>
            {withdrawError ? <p className="my-page-error">{withdrawError}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default MyPage
