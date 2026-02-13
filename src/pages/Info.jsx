import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTipPost, fetchTipPosts } from '../api/endpoints/tip'

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

const toAttachmentFlag = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return null
    if (['y', 'yes', 'true', '1', 't'].includes(normalized)) return true
    if (['n', 'no', 'false', '0', 'f'].includes(normalized)) return false
  }
  return null
}

const resolveHasFile = (post) => {
  const flagCandidates = [
    post.hasFile,
    post.hasAttachment,
    post.hasAttachedFile,
    post.hasAttachedImage,
    post.fileAttached,
    post.fileAttachedYn,
    post.attachmentYn,
  ]
  for (const candidate of flagCandidates) {
    const parsed = toAttachmentFlag(candidate)
    if (parsed !== null) return { known: true, value: parsed }
  }

  const countCandidates = [post.attachmentCount, post.fileCount]
  for (const candidate of countCandidates) {
    if (candidate == null || candidate === '') continue
    const parsed = Number(candidate)
    if (Number.isFinite(parsed)) return { known: true, value: parsed > 0 }
  }

  const fileHints = [
    post.fileOriginalName,
    post.fileContentType,
    post.fileSize,
    post.fileDownloadUrl,
    post.fileUrl,
    post.file_name,
    post.fileName,
    post.attachmentUrl,
  ]
  if (fileHints.some((value) => value != null && String(value).trim() !== '')) {
    return { known: true, value: true }
  }

  return { known: false, value: false }
}

const normalizePost = (post, index) => {
  const hasFile = resolveHasFile(post)
  return {
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
    hasFile: hasFile.value,
    hasFileKnown: hasFile.known,
    pinned: post.pinned ?? post.notice ?? false,
  }
}

function Info() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const pageSize = 29

  useEffect(() => {
    let isActive = true

    const loadPosts = async () => {
      setStatus('loading')
      setErrorMessage('')
      try {
        const trimmedKeyword = searchKeyword.trim()
        const baseParams = {
          size: pageSize,
          sort: 'createdAt,desc',
          ...(trimmedKeyword
            ? {
                keyword: trimmedKeyword,
                query: trimmedKeyword,
                search: trimmedKeyword,
                title: trimmedKeyword,
              }
            : {}),
        }
        const extractList = (payload) =>
          Array.isArray(payload)
            ? payload
            : payload?.content ?? payload?.items ?? payload?.data ?? []

        let normalized = []
        let resolvedTotalPages = 0

        if (!trimmedKeyword) {
          const data = await fetchTipPosts({
            page,
            ...baseParams,
          })
          const list = extractList(data)
          normalized = list.map((post, index) => normalizePost(post, index))
          resolvedTotalPages = Number.isFinite(data?.totalPages)
            ? data.totalPages
            : Math.ceil(normalized.length / pageSize)
        } else {
          const firstPageData = await fetchTipPosts({ page: 0, ...baseParams })
          const firstPageList = extractList(firstPageData)
          let merged = [...firstPageList]
          const total = Number.isFinite(firstPageData?.totalPages) ? firstPageData.totalPages : 1
          if (!Array.isArray(firstPageData) && total > 1) {
            const restPages = Array.from({ length: total - 1 }, (_, index) => index + 1)
            const restResults = await Promise.allSettled(
              restPages.map((nextPage) =>
                fetchTipPosts({ page: nextPage, ...baseParams }).then(extractList),
              ),
            )
            restResults.forEach((entry) => {
              if (entry.status !== 'fulfilled') return
              merged = merged.concat(entry.value)
            })
          }

          const allNormalized = merged
            .map((post, index) => normalizePost(post, index))
            .filter((post) => String(post.title ?? '').toLowerCase().includes(trimmedKeyword.toLowerCase()))
          resolvedTotalPages = Math.ceil(allNormalized.length / pageSize)
          const start = page * pageSize
          normalized = allNormalized.slice(start, start + pageSize)
        }

        if (isActive) {
          setPosts(normalized)
          setTotalPages(resolvedTotalPages)
          setStatus('success')
        }

        const unresolved = normalized.filter((post) => !post.hasFileKnown && post.id != null)
        if (unresolved.length) {
          const results = await Promise.allSettled(
            unresolved.map(async (post) => {
              const detail = await fetchTipPost(post.id)
              return {
                id: post.id,
                hasFile: resolveHasFile(detail).value,
              }
            }),
          )
          if (isActive) {
            const hasFileById = new Map()
            results.forEach((entry) => {
              if (entry.status !== 'fulfilled') return
              hasFileById.set(entry.value.id, entry.value.hasFile)
            })
            if (hasFileById.size) {
              setPosts((prev) =>
                prev.map((post) =>
                  hasFileById.has(post.id)
                    ? { ...post, hasFile: hasFileById.get(post.id), hasFileKnown: true }
                    : post,
                ),
              )
            }
          }
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
  }, [page, searchKeyword])

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || (totalPages && nextPage >= totalPages)) return
    setPage(nextPage)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearchKeyword(searchInput.trim())
  }

  const handleSearchReset = () => {
    setPage(0)
    setSearchInput('')
    setSearchKeyword('')
    setSearchOpen(false)
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
          <button
            className={`community-icon-button community-icon-button--search${searchOpen ? ' is-active' : ''}`}
            type="button"
            aria-label="검색"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 4a6 6 0 1 0 3.74 10.7l4.53 4.53 1.41-1.41-4.53-4.53A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </button>
        </div>
      </div>
      {searchOpen ? (
        <form className="community-searchbar" onSubmit={handleSearchSubmit}>
          <input
            className="community-search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="제목 검색"
          />
          <button className="community-search-submit" type="submit">검색</button>
          {(searchKeyword || searchInput) ? (
            <button
              className="community-search-reset"
              type="button"
              onClick={handleSearchReset}
            >
              초기화
            </button>
          ) : null}
        </form>
      ) : null}

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
                {post.pinned ? <span className="post-badge">공지</span> : null}
                <span className="post-icon" aria-hidden="true">💬</span>
                {post.hasFile ? (
                  <span className="post-icon post-icon--file" aria-hidden="true">🖼️</span>
                ) : null}
                <Link className="post-title-link" to={`/info/${post.id}`}>
                  <span className="post-title">{post.title}</span>
                </Link>
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
