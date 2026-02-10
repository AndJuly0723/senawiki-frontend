import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUser, isAdminUser } from '../utils/authStorage'

function Admin() {
  const user = getStoredUser()
  const isAdmin = useMemo(() => isAdminUser(user), [user])

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
    <section className="admin-page admin-page--entry">
      <h1>관리자 페이지</h1>
      <div className="admin-entry-grid">
        <Link to="/admin/heroes" className="admin-entry-button">영웅 등록</Link>
        <Link to="/admin/pets" className="admin-entry-button">펫 등록</Link>
        <Link to="/admin/stats" className="admin-entry-button">통계</Link>
      </div>
    </section>
  )
}

export default Admin
