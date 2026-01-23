import { Link, useParams } from 'react-router-dom'
import { heroes } from '../data/heroes'

function HeroDetail() {
  const { heroId } = useParams()
  const hero = heroes.find((item) => item.id === heroId)

  if (!hero) {
    return (
      <section className="hero-detail">
        <h1>영웅을 찾을 수 없습니다</h1>
        <Link to="/heroes" className="hero-back">영웅 목록으로</Link>
      </section>
    )
  }

  return (
    <section className="hero-detail">
      <Link to="/heroes" className="hero-back">← 영웅 목록</Link>
      <h1>{hero.name}</h1>
      <div className="hero-detail-card">
        <img src={hero.image} alt={hero.name} />
      </div>
    </section>
  )
}

export default HeroDetail
