import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../api/endpoints/adminStats'
import { getStoredUser, isAdminUser } from '../utils/authStorage'

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatUpdatedAt = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
}

function AdminStats() {
  const user = getStoredUser()
  const isAdmin = useMemo(() => isAdminUser(user), [user])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [stats, setStats] = useState(null)

  const loadStats = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const data = await fetchAdminStats()
      setStats({
        totalUsers: toNumber(data?.totalUsers),
        newUsersToday: toNumber(data?.newUsersToday),
        totalPosts: toNumber(data?.totalPosts),
        newPostsToday: toNumber(data?.newPostsToday),
        totalUploads: toNumber(data?.totalUploads),
        newUploadsToday: toNumber(data?.newUploadsToday),
        totalVisitors: toNumber(data?.totalVisitors),
        dailyVisitors: toNumber(data?.dailyVisitors),
      })
      setLastUpdatedAt(new Date())
      setStatus('success')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '통계 정보를 불러오지 못했습니다.'
      setErrorMessage(message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    const timerId = setTimeout(() => {
      loadStats()
    }, 0)
    return () => {
      clearTimeout(timerId)
    }
  }, [isAdmin, loadStats])

  if (!isAdmin) {
    return (
      <section className="admin-page">
        <div className="admin-empty">
          <h1>관리자 권한이 필요합니다</h1>
          <p>관리자 계정으로 로그인 후 이용해주세요.</p>
          <div className="admin-empty-actions">
            <Link to="/login" className="auth-button">로그인</Link>
            <Link to="/" className="auth-button auth-button--ghost">홈으로</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page admin-page--form">
      <div className="admin-top-actions">
        <Link to="/admin" className="auth-button auth-button--ghost">관리자 메인</Link>
      </div>
      <div className="admin-card">
        <div className="admin-stats-toolbar">
          <h2>통계</h2>
          <button
            type="button"
            className="auth-button auth-button--ghost"
            onClick={loadStats}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '갱신 중...' : '새로고침'}
          </button>
        </div>
        <p className="admin-stats-updated-at">
          마지막 갱신: {formatUpdatedAt(lastUpdatedAt)}
        </p>
        {status === 'loading' ? (
          <div className="admin-message admin-message--success">통계 정보를 불러오는 중...</div>
        ) : null}
        {status === 'error' ? (
          <div className="admin-message admin-message--error">{errorMessage}</div>
        ) : null}
        {status === 'success' && stats ? (
          <div className="admin-stats-grid">
            <article className="admin-stat-card">
              <span className="admin-stat-label">전체 회원수</span>
              <strong className="admin-stat-value">{stats.totalUsers.toLocaleString()}</strong>
              <span className="admin-stat-sub">오늘 신규 {stats.newUsersToday.toLocaleString()}</span>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">전체 방문자</span>
              <strong className="admin-stat-value">{stats.totalVisitors.toLocaleString()}</strong>
              <span className="admin-stat-sub">오늘 방문 {stats.dailyVisitors.toLocaleString()}</span>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">전체 게시글</span>
              <strong className="admin-stat-value">{stats.totalPosts.toLocaleString()}</strong>
              <span className="admin-stat-sub">오늘 게시글 {stats.newPostsToday.toLocaleString()}</span>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-label">전체 첨부 업로드</span>
              <strong className="admin-stat-value">{stats.totalUploads.toLocaleString()}</strong>
              <span className="admin-stat-sub">오늘 업로드 {stats.newUploadsToday.toLocaleString()}</span>
            </article>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default AdminStats
