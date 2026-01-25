import { Link, useParams } from 'react-router-dom'

const siegeMeta = {
  mon: { day: '월요일', castle: '수호자의 성' },
  tue: { day: '화요일', castle: '포디나의 성' },
  wed: { day: '수요일', castle: '불멸의 성' },
  thu: { day: '목요일', castle: '죽음의 성' },
  fri: { day: '금요일', castle: '고대용의 성' },
  sat: { day: '토요일', castle: '혹한의 성' },
  sun: { day: '일요일', castle: '지옥의 성' },
}

function GuildSiegeDay() {
  const { day } = useParams()
  const meta = siegeMeta[day]
  const title = meta ? `${meta.day} - ${meta.castle}` : '공성전'

  return (
    <section className="siege-day-page">
      <Link to="/guild/siege" className="hero-back">← 공성전</Link>
      <h1>{title}</h1>
      <p>공성전 공략 페이지입니다.</p>
    </section>
  )
}

export default GuildSiegeDay
