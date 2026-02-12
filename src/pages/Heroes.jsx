import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { contentChangeEvent, getAllHeroes } from '../utils/contentStorage'

function Heroes() {
  const [gradeFilter, setGradeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [allHeroes, setAllHeroes] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('heroesScrollY')
    const nextScroll = savedScroll ? Number(savedScroll) : 0
    requestAnimationFrame(() => {
      window.scrollTo({ top: Number.isNaN(nextScroll) ? 0 : nextScroll, behavior: 'auto' })
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('heroesScrollY', String(window.scrollY))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const loadHeroes = async () => {
      try {
        setAllHeroes(await getAllHeroes())
        setLoadError('')
      } catch (error) {
        setAllHeroes([])
        setLoadError(error?.message || 'Failed to load heroes. Please try again.')
      }
    }
    const handleContentChange = () => {
      loadHeroes()
    }
    loadHeroes()
    window.addEventListener(contentChangeEvent, handleContentChange)
    return () => window.removeEventListener(contentChangeEvent, handleContentChange)
  }, [])

  const filteredHeroes = useMemo(() => {
    return allHeroes.filter((hero) => {
      const gradeOk = gradeFilter === 'all' || hero.grade === gradeFilter
      const typeOk = typeFilter === 'all' || hero.type === typeFilter
      return gradeOk && typeOk
    })
  }, [allHeroes, gradeFilter, typeFilter])

  return (
    <section>
      <div className="hero-header">
        <h1>영웅</h1>
        <div className="hero-filters" aria-label="영웅 필터">
          <label className="hero-filter">
            <span>등급</span>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="sena">구세나</option>
              <option value="special">스페셜</option>
              <option value="legend">전설</option>
              <option value="rare">희귀</option>
            </select>
          </label>
          <label className="hero-filter">
            <span>역할</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="attack">공격형</option>
              <option value="magic">마법형</option>
              <option value="defense">방어형</option>
              <option value="support">지원형</option>
              <option value="allround">만능형</option>
            </select>
          </label>
        </div>
      </div>
      {loadError ? <div className="community-error">{loadError}</div> : null}
      {!loadError && filteredHeroes.length === 0 ? (
        <div className="community-empty">표시할 영웅이 없습니다.</div>
      ) : null}
      <div className="hero-grid">
        {filteredHeroes.map((hero) => (
          <Link
            key={hero.id}
            to={`/heroes/${hero.id}`}
            className={`hero-card hero-card--${hero.grade}`}
          >
            <div className="hero-card-type">
              {hero.typeIcon ? <img src={hero.typeIcon} alt="" aria-hidden="true" /> : null}
              <span>{hero.typeLabel}</span>
            </div>
            <div className="hero-card-image">
              <img src={hero.image} alt={hero.name} loading="lazy" />
            </div>
            <div className="hero-card-name">{hero.name}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Heroes
