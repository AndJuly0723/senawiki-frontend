import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { contentChangeEvent, getAllPets } from '../utils/contentStorage'

function Pets() {
  const [gradeFilter, setGradeFilter] = useState('all')
  const [allPets, setAllPets] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadPets = async () => {
      try {
        setAllPets(await getAllPets())
        setLoadError('')
      } catch (error) {
        setAllPets([])
        setLoadError(error?.message || 'Failed to load pets. Please try again.')
      }
    }
    const handleContentChange = () => {
      loadPets()
    }
    loadPets()
    window.addEventListener(contentChangeEvent, handleContentChange)
    return () => window.removeEventListener(contentChangeEvent, handleContentChange)
  }, [])

  const filteredPets = useMemo(() => {
    if (gradeFilter === 'all') return allPets
    return allPets.filter((pet) => pet.grade === gradeFilter)
  }, [allPets, gradeFilter])

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
      {loadError ? <div className="community-error">{loadError}</div> : null}
      {!loadError && filteredPets.length === 0 ? (
        <div className="community-empty">표시할 펫이 없습니다.</div>
      ) : null}
      <div className="pet-grid">
        {filteredPets.map((pet) => (
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
