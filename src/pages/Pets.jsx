import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { pets } from '../data/pets'

function Pets() {
  const [gradeFilter, setGradeFilter] = useState('all')

  const gradeOrder = {
    legend: 0,
    rare: 1,
    unknown: 99,
  }

  const filteredPets = useMemo(() => {
    if (gradeFilter === 'all') return pets
    return pets.filter((pet) => pet.grade === gradeFilter)
  }, [gradeFilter])

  const sortedPets = useMemo(() => {
    return [...filteredPets].sort((a, b) => {
      const byGrade = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99)
      if (byGrade !== 0) return byGrade
      return a.name.localeCompare(b.name, 'ko')
    })
  }, [filteredPets])

  return (
    <section>
      <div className="pet-header">
        <h1>펫</h1>
        <div className="pet-filters" aria-label="펫 필터">
          <label className="pet-filter">
            <span>등급</span>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="legend">전설</option>
              <option value="rare">희귀</option>
            </select>
          </label>
        </div>
      </div>
      <div className="pet-grid">
        {sortedPets.map((pet) => (
          <Link key={pet.id} to={`/pets/${pet.id}`} className={`pet-card pet-card--${pet.grade}`}>
            <div className="pet-card-image">
              <img src={pet.image} alt={pet.name} loading="lazy" />
            </div>
            <div className="pet-card-name">{pet.name}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Pets
