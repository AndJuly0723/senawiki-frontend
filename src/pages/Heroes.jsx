import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroes } from '../data/heroes'

function Heroes() {
  const [gradeFilter, setGradeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const gradeOrder = {
    sena: 0,
    special: 1,
    legend: 2,
    rare: 3,
    unknown: 99,
  }

  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const gradeOk = gradeFilter === 'all' || hero.grade === gradeFilter
      const typeOk = typeFilter === 'all' || hero.type === typeFilter
      return gradeOk && typeOk
    })
  }, [gradeFilter, typeFilter])

  const sortedHeroes = useMemo(() => {
    return [...filteredHeroes].sort((a, b) => {
      const byGrade = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99)
      if (byGrade !== 0) return byGrade
      return a.name.localeCompare(b.name, 'ko')
    })
  }, [filteredHeroes])

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
      <div className="hero-grid">
        {sortedHeroes.map((hero) => (
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
