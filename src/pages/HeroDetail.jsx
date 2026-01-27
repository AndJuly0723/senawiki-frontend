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
    <section className={`hero-detail hero-detail--${hero.grade}`}>
      <Link to="/heroes" className="hero-back">← 영웅 목록</Link>
      <div className="hero-detail-layout">
        <aside className="hero-profile">
          <div className="hero-profile-header">
            <h1>{hero.name}</h1>
          </div>
          <div className="hero-profile-image">
            <img src={hero.image} alt={hero.name} />
          </div>
          <div className="hero-profile-meta">
            <div className="hero-meta-row">
              <span>별명</span>
              {hero.nickname ? <strong>{hero.nickname}</strong> : <strong>추가 예정</strong>}
            </div>
            <div className="hero-meta-row">
              <span>획득 경로</span>
              {hero.acquisition && hero.acquisition.length > 0 ? (
                <span className="hero-meta-list">{hero.acquisition.join(', ')}</span>
              ) : (
                <strong>추가 예정</strong>
              )}
            </div>
          </div>
          <div className="hero-role">
            <h2>영웅 역할</h2>
            <div className="hero-role-item">
              {hero.typeIcon ? <img src={hero.typeIcon} alt="" aria-hidden="true" /> : null}
              <span>{hero.typeLabel}</span>
            </div>
          </div>
        </aside>
        <div className="hero-detail-main">
          <section className="hero-skills">
            <div className="hero-skills-header">스킬</div>
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={`/images/heroskill/${hero.id}/basic.png`} alt="" aria-hidden="true" />
              </div>
              <div className="hero-skill-body">
                <h3>기본 공격</h3>
              </div>
            </div>
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={`/images/heroskill/${hero.id}/skill1.png`} alt="" aria-hidden="true" />
              </div>
              <div className="hero-skill-body">
                <h3>스킬 1</h3>
              </div>
            </div>
            {hero.hasSkill2 && (
              <div className="hero-skill-row">
                <div className="hero-skill-icon">
                  <img src={`/images/heroskill/${hero.id}/skill2.png`} alt="" aria-hidden="true" />
                </div>
                <div className="hero-skill-body">
                  <h3>스킬 2</h3>
                </div>
              </div>
            )}
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={`/images/heroskill/${hero.id}/passive.png`} alt="" aria-hidden="true" />
              </div>
              <div className="hero-skill-body">
                <h3>패시브</h3>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section className="hero-content">
        <div className="hero-section-header">영웅 사용 콘텐츠</div>
        <div className="hero-section-body">
          {hero.usage && hero.usage.length > 0
            ? hero.usage.join(', ')
            : '추후 내용을 추가할 예정입니다.'}
        </div>
      </section>
      <section className="hero-gear">
        <div className="hero-section-header">영웅 장비</div>
        <div className="hero-section-body">
          {hero.gear && hero.gear.length > 0
            ? hero.gear.join(', ')
            : '추후 내용을 추가할 예정입니다.'}
        </div>
      </section>
      <section className="hero-comments">
        <div className="hero-section-header">댓글</div>
        <div className="hero-comments-body">
          <div className="hero-comment">
            <div className="hero-comment-head">
              <strong>유저명</strong>
              <span>2026-01-23 12:00</span>
            </div>
            <p>댓글 내용 예시입니다. 추후 댓글 시스템을 연결하세요.</p>
          </div>
          <div className="hero-comment">
            <div className="hero-comment-head">
              <strong>유저명</strong>
              <span>2026-01-23 12:05</span>
            </div>
            <p>댓글 내용 예시입니다.</p>
          </div>
          <div className="hero-comment-form">
            <textarea placeholder="댓글을 입력하세요." rows="3" />
            <button type="button">등록</button>
          </div>
        </div>
      </section>
    </section>
  )
}

export default HeroDetail
