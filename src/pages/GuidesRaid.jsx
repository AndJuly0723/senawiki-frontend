import { Link } from 'react-router-dom'

const raids = [
  { id: 'ruin-eye', label: '파멸의 눈동자', image: '/images/raid/eyes.png' },
  { id: 'bull-demon-king', label: '우마왕', image: '/images/raid/yu.png' },
  { id: 'iron-devourer', label: '강철의 포식자', image: '/images/raid/po.png' },
]

function GuidesRaid() {
  return (
    <section className="raid-list-page">
      <h1>레이드</h1>
      <p>공략할 레이드를 선택해주세요.</p>
      <div className="raid-list">
        {raids.map((raid) => (
          <Link key={raid.id} to={`/guides/raid/${raid.id}`} className="raid-item">
            <img src={raid.image} alt={raid.label} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default GuidesRaid
