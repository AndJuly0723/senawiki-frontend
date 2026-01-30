import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTipPosts } from '../api/endpoints/tip'

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const parts = date
    .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
    .match(/\d+/g)
  if (!parts || parts.length < 2) return String(value)
  return `${parts[0]}-${parts[1]}`
}

const normalizePost = (post, index) => ({
  id: post.id ?? post.postId ?? post.communityId ?? post._id ?? `post-${index}`,
  title: post.title ?? post.subject ?? '',
  author:
    post.authorNickname ??
    post.nickname ??
    post.authorName ??
    post.author ??
    post.writer ??
    post.name ??
    post.email ??
    '익명',
  date: formatDate(post.createdAt ?? post.created_at ?? post.date),
  views: post.viewCount ?? post.views ?? 0,
  commentCount: Number.isFinite(post.commentCount) ? post.commentCount : 0,
  hasFile: Boolean(
    post.fileOriginalName ?? post.fileContentType ?? post.fileSize ?? post.fileDownloadUrl,
  ),
  pinned: post.pinned ?? post.notice ?? false,
})

function Info() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 29

  useEffect(() => {
    let isActive = true

    const loadPosts = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const data = await fetchTipPosts({
          page,
          size: pageSize,
          sort: 'createdAt,desc',
        })
        const list = Array.isArray(data)
          ? data
          : data?.content ?? data?.items ?? data?.data ?? []
        const normalized = list.map((post, index) => normalizePost(post, index))
        if (isActive) {
          setPosts(normalized)
          setTotalPages(Number.isFinite(data?.totalPages) ? data.totalPages : 0)
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

    loadPosts()
    return () => {
      isActive = false
    }
  }, [page])

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || (totalPages && nextPage >= totalPages)) return
    setPage(nextPage)
  }

  const pagination = () => {
    if (totalPages <= 1) return null
    const maxButtons = 5
    const start = Math.max(0, page - Math.floor(maxButtons / 2))
    const end = Math.min(totalPages - 1, start + maxButtons - 1)
    const pages = []
    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }
    return (
      <div className="community-pagination">
        <button
          className="community-page-button"
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          이전
        </button>
        <div className="community-page-list">
          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              className={`community-page-button${pageNumber === page ? ' is-active' : ''}`}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber + 1}
            </button>
          ))}
        </div>
        <button
          className="community-page-button"
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={totalPages ? page >= totalPages - 1 : posts.length < pageSize}
        >
          다음
        </button>
      </div>
    )
  }

  return (
    <section className="community">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>정보&팁</h1>
          <p>게임에 도움이 되는 정보와 팁을 공유합니다.</p>
        </div>
        <div className="community-actions">
          <Link className="community-icon-button" to="/info/write" aria-label="글쓰기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25z" />
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="community-table">
        <div className="community-header">
          <span className="col-title">제목</span>
          <span className="col-author">작성자</span>
          <span className="col-date">작성일</span>
          <span className="col-views">조회</span>
        </div>
        <div className="community-body">
          {status === 'loading' ? (
            <div className="community-row community-row--empty">
              <span className="community-empty">게시글을 불러오는 중...</span>
            </div>
          ) : null}
          {status === 'error' ? (
            <div className="community-row community-row--empty">
              <span className="community-error">{errorMessage}</span>
            </div>
          ) : null}
          {status === 'success' && posts.length === 0 ? (
            <div className="community-row community-row--empty">
              <span className="community-empty">게시글이 없습니다.</span>
            </div>
          ) : null}
          {posts.map((post) => (
            <div key={post.id} className={`community-row${post.pinned ? ' is-pinned' : ''}`}>
              <div className="col-title">
                <span className="post-icon" aria-hidden="true">💬</span>
                {post.hasFile ? (
                  <span className="post-icon post-icon--file" aria-hidden="true">🖼️</span>
                ) : null}
                <Link className="post-title-link" to={`/info/${post.id}`}>
                  <span className="post-title">{post.title}</span>
                </Link>
                {post.pinned ? <span className="post-badge">공지</span> : null}
                {post.commentCount > 0 ? (
                  <span className="post-comment-count" aria-label={`댓글 ${post.commentCount}개`}>
                    💭 {post.commentCount}
                  </span>
                ) : null}
              </div>
              <span className="col-author">{post.author}</span>
              <span className="col-date">{post.date}</span>
              <span className="col-views">{post.views}</span>
            </div>
          ))}
        </div>
      </div>
      {pagination()}
    </section>
  )
}

export default Info
