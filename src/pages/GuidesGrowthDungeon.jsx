import { Link } from 'react-router-dom'

const stages = [
  { id: 'fire', label: '불의 원소 던전', image: '/images/growth/fire.png' },
  { id: 'water', label: '물의 원소 던전', image: '/images/growth/water.png' },
  { id: 'earth', label: '땅의 원소 던전', image: '/images/growth/earth.png' },
  { id: 'light', label: '빛의 원소 던전', image: '/images/growth/light.png' },
  { id: 'dark', label: '암흑의 원소 던전', image: '/images/growth/dark.png' },
  { id: 'gold', label: '골드 던전', image: '/images/growth/gold.png' },
]

function GuidesGrowthDungeon() {
  return (
    <section className="growth-dungeon">
      <h1>성장던전</h1>
      <p>성장 던전을 선택해주세요.</p>
      <div className="growth-list">
        {stages.map((stage) => (
          <Link key={stage.id} to={`/guides/growth-dungeon/${stage.id}`} className="growth-item">
            <img src={stage.image} alt={stage.label} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default GuidesGrowthDungeon
