import { Link } from 'react-router-dom'

const sites = [
  { day: '월요일', castle: '수호자의 성', slug: 'mon', className: 'siege-site--mon' },
  { day: '화요일', castle: '포디나의 성', slug: 'tue', className: 'siege-site--tue' },
  { day: '수요일', castle: '불멸의 성', slug: 'wed', className: 'siege-site--wed' },
  { day: '목요일', castle: '죽음의 성', slug: 'thu', className: 'siege-site--thu' },
  { day: '금요일', castle: '고대용의 성', slug: 'fri', className: 'siege-site--fri' },
  { day: '토요일', castle: '혹한의 성', slug: 'sat', className: 'siege-site--sat' },
  { day: '일요일', castle: '지옥의 성', slug: 'sun', className: 'siege-site--sun' },
]

function GuildSiege() {
  return (
    <section className="siege-page siege-map-page">
      <h1>공성전</h1>
      <p>요일별 대륙을 클릭하여 주세요.</p>
      <div className="siege-map" role="img" aria-label="공성전 지도">
        {sites.map((site) => (
          <Link
            key={site.slug}
            to={`/guild/siege/${site.slug}`}
            className={`siege-site ${site.className}`}
            aria-label={`${site.day} ${site.castle} 공략 페이지 이동`}
          >
            <span className="siege-site-day">{site.day}</span>
            <span className="siege-site-castle">{site.castle}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default GuildSiege
