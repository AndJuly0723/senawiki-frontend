import { Link } from 'react-router-dom'

const expeditionSites = [
  { id: 'teo', label: '태오', className: 'expedition-site--1' },
  { id: 'kyle', label: '카일', className: 'expedition-site--2' },
  { id: 'destroyer-god', label: '파괴신', className: 'expedition-site--3' },
  { id: 'yeonhee', label: '연희', className: 'expedition-site--4' },
  { id: 'karma', label: '카르마', className: 'expedition-site--5' },
]

function GuildExpedition() {
  return (
    <section className="expedition-page expedition-map-page">
      <h1>강림원정대</h1>
      <p>공략할 대상을 선택해주세요.</p>
      <div className="expedition-map" role="img" aria-label="강림원정대 배치도">
        {expeditionSites.map((site) => (
          <Link
            key={site.id}
            to={`/guild/expedition/${site.id}`}
            className={`expedition-site ${site.className}`}
            aria-label={`${site.label} 공략 페이지 이동`}
          >
            <span className="expedition-site-label">{site.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default GuildExpedition
