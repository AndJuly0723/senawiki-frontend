import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCommunityPosts } from '../api/endpoints/community'
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
  pinned: post.pinned ?? post.notice ?? false,
  commentCount: Number.isFinite(post.commentCount) ? post.commentCount : 0,
})

function Home() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [tipPosts, setTipPosts] = useState([])
  const [tipStatus, setTipStatus] = useState('idle')
  const [tipErrorMessage, setTipErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    const loadPosts = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const data = await fetchCommunityPosts({
          page: 0,
          size: 7,
          sort: 'createdAt,desc',
        })
        const list = Array.isArray(data)
          ? data
          : data?.content ?? data?.items ?? data?.data ?? []
        const normalized = list.map((post, index) => normalizePost(post, index))
        if (isActive) {
          setPosts(normalized.slice(0, 7))
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
  }, [])

  useEffect(() => {
    let isActive = true

    const loadTipPosts = async () => {
      setTipStatus('loading')
      setTipErrorMessage('')
      try {
        const data = await fetchTipPosts({
          page: 0,
          size: 7,
          sort: 'createdAt,desc',
        })
        const list = Array.isArray(data)
          ? data
          : data?.content ?? data?.items ?? data?.data ?? []
        const normalized = list.map((post, index) => normalizePost(post, index))
        if (isActive) {
          setTipPosts(normalized.slice(0, 7))
          setTipStatus('success')
        }
      } catch (error) {
        if (isActive) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            '게시글을 불러오지 못했습니다.'
          setTipErrorMessage(message)
          setTipStatus('error')
        }
      }
    }

    loadTipPosts()
    return () => {
      isActive = false
    }
  }, [])

  return (
    <>
      <section className="home-community">
        <div className="community-toolbar">
          <div className="community-title">
            <h1>커뮤니티 최신글</h1>
          </div>
          <div className="community-actions">
            <Link className="home-community-more" to="/community">
              더보기
            </Link>
          </div>
        </div>

        <div className="community-table">
          <div className="community-header">
            <span className="col-title">제목</span>
            <span className="col-author">작성자</span>
            <span className="col-date">작성일</span>
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
                  <Link className="post-title-link" to={`/community/${post.id}`}>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-community">
        <div className="community-toolbar">
          <div className="community-title">
            <h1>정보&팁 최신글</h1>
          </div>
          <div className="community-actions">
            <Link className="home-community-more" to="/info">
              더보기
            </Link>
          </div>
        </div>

        <div className="community-table">
          <div className="community-header">
            <span className="col-title">제목</span>
            <span className="col-author">작성자</span>
            <span className="col-date">작성일</span>
          </div>
          <div className="community-body">
            {tipStatus === 'loading' ? (
              <div className="community-row community-row--empty">
                <span className="community-empty">게시글을 불러오는 중...</span>
              </div>
            ) : null}
            {tipStatus === 'error' ? (
              <div className="community-row community-row--empty">
                <span className="community-error">{tipErrorMessage}</span>
              </div>
            ) : null}
            {tipStatus === 'success' && tipPosts.length === 0 ? (
              <div className="community-row community-row--empty">
                <span className="community-empty">게시글이 없습니다.</span>
              </div>
            ) : null}
            {tipPosts.map((post) => (
              <div key={post.id} className={`community-row${post.pinned ? ' is-pinned' : ''}`}>
                <div className="col-title">
                  <span className="post-icon" aria-hidden="true">💬</span>
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
