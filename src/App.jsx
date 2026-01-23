import { NavLink, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="SENA.WiKi home">
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
              SENA.WiKi
            </text>
          </svg>
        </NavLink>
      </header>
      <nav className="site-nav" aria-label="Primary">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          HOME
        </NavLink>
        <NavLink to="/heroes" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          영웅
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          커뮤니티
        </NavLink>
        <NavLink to="/info" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
          정보
        </NavLink>
      </nav>
      <section className="hero-search" aria-label="Hero search">
        <div className="hero-search-inner">
          <input
            className="hero-search-input"
            type="search"
            placeholder="영웅 검색"
            aria-label="영웅 검색"
          />
          <button className="hero-search-button" type="button">
            검색
          </button>
        </div>
      </section>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}

export default App
