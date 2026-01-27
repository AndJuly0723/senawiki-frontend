import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import { heroes } from './data/heroes'
import { clearAuth, getStoredUser } from './utils/authStorage'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const trimmedSearch = searchTerm.trim()
  const [openMenu, setOpenMenu] = useState(null)
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(getStoredUser())

  const searchResults = useMemo(() => {
    if (!trimmedSearch) return []
    const query = trimmedSearch.toLowerCase()
    return heroes.filter((hero) => hero.name.toLowerCase().includes(query))
  }, [trimmedSearch])

  const handleSearch = () => {
    if (searchResults.length > 0) {
      navigate(`/heroes/${searchResults[0].id}`)
      setSearchTerm('')
    }
  }

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser())
    }
    window.addEventListener('authchange', handleAuthChange)
    return () => window.removeEventListener('authchange', handleAuthChange)
  }, [])

  return (
    <div className="app">
      <ScrollToTop />
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="SENAWiKi home">
          <svg
            className="brand-logo"
            viewBox="0 0 520 160"
            role="img"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7e7b5" />
                <stop offset="45%" stopColor="#e2c88a" />
                <stop offset="60%" stopColor="#b8945e" />
                <stop offset="100%" stopColor="#f2e0ae" />
              </linearGradient>
              <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b0b0b" />
                <stop offset="65%" stopColor="#0b0b0b" />
                <stop offset="100%" stopColor="#9c1c1c" />
              </linearGradient>
              <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffefc0" />
                <stop offset="30%" stopColor="#ff3b3b" />
                <stop offset="70%" stopColor="#b30000" />
                <stop offset="100%" stopColor="#ffd27a" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
              </filter>
            </defs>
            <rect x="10" y="10" width="500" height="140" rx="22" fill="url(#inner)" stroke="url(#gold)" strokeWidth="6" filter="url(#shadow)" />
            <rect x="26" y="26" width="468" height="108" rx="16" fill="rgba(0,0,0,0.2)" stroke="url(#gold)" strokeWidth="3" />
            <g>
              <polygon points="260,22 286,50 272,132 260,144 248,132 234,50" fill="url(#gem)" stroke="#f7e7b5" strokeWidth="3" />
              <polygon points="260,34 278,54 266,122 260,130 254,122 242,54" fill="#ff2f2f" opacity="0.9" />
              <polygon points="260,38 270,56 264,118 260,124 256,118 250,56" fill="#ff7b7b" opacity="0.55" />
            </g>
            <text
              x="260"
              y="105"
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="64"
              fill="url(#gold)"
              stroke="#3a2b16"
              strokeWidth="2.2"
              fontWeight="700"
              letterSpacing="2"
            >
              SENAWiKi
            </text>
          </svg>
        </NavLink>
        <div className="auth-actions">
          {currentUser ? (
            <>
              <span className="auth-user">{currentUser.nickname ?? currentUser.name}</span>
              <button
                className="auth-button auth-button--ghost"
                type="button"
                onClick={() => {
                  clearAuth()
                  navigate('/')
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link className="auth-button auth-button--ghost" to="/login">
                로그인
              </Link>
              <Link className="auth-button" to="/register">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          HOME
        </NavLink>
        <NavLink to="/heroes" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          영웅
        </NavLink>
        <NavLink to="/pets" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          펫
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          커뮤니티
        </NavLink>
        <div
          className={`nav-dropdown${openMenu === 'guides' ? ' is-open' : ''}`}
          onMouseEnter={() => setOpenMenu('guides')}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="nav-link nav-link--dropdown" type="button">
            공략
            <span className="nav-caret" aria-hidden="true">▾</span>
          </button>
          <div className="nav-dropdown-menu" role="menu">
            <NavLink to="/guides/adventure" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>모험</NavLink>
            <NavLink to="/guides/raid" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>레이드</NavLink>
            <NavLink to="/guides/arena" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>결투장</NavLink>
            <NavLink to="/guides/total-war" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>총력전</NavLink>
            <NavLink to="/guides/growth-dungeon" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>성장던전</NavLink>
          </div>
        </div>
        <div
          className={`nav-dropdown${openMenu === 'guild' ? ' is-open' : ''}`}
          onMouseEnter={() => setOpenMenu('guild')}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button className="nav-link nav-link--dropdown" type="button">
            길드
            <span className="nav-caret" aria-hidden="true">▾</span>
          </button>
          <div className="nav-dropdown-menu" role="menu">
            <NavLink to="/guild/siege" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>공성전</NavLink>
            <NavLink to="/guild/guild-war" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>길드전</NavLink>
            <NavLink to="/guild/expedition" role="menuitem" className="nav-dropdown-item" onClick={() => setOpenMenu(null)}>강림원정대</NavLink>
          </div>
        </div>
      </nav>
      <section className="hero-search" aria-label="Hero search">
        <div className="hero-search-inner">
          <input
            className="hero-search-input"
            type="search"
            placeholder="영웅 검색"
            aria-label="영웅 검색"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSearch()
              }
            }}
          />
          <button className="hero-search-button" type="button" onClick={handleSearch}>
            검색
          </button>
        </div>
        {trimmedSearch && (
          <div className="hero-search-results" role="listbox" aria-label="영웅 검색 결과">
            {searchResults.length === 0 ? (
              <div className="hero-search-empty">검색 결과가 없습니다.</div>
            ) : (
              searchResults.map((hero) => (
                <Link
                  key={hero.id}
                  to={`/heroes/${hero.id}`}
                  className="hero-search-item"
                  onClick={() => setSearchTerm('')}
                >
                  <img src={hero.image} alt="" aria-hidden="true" />
                  <span>{hero.name}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}

export default App
