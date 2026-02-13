import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getHeroById } from '../utils/contentStorage'

function HeroDetail() {
  const { heroId } = useParams()
  const [hero, setHero] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadHero = async () => {
      setIsLoading(true)
      try {
        const result = await getHeroById(heroId)
        if (!mounted) return
        setHero(result ?? null)
        setLoadError('')
      } catch (error) {
        if (!mounted) return
        setHero(null)
        setLoadError(error?.message || 'Failed to load hero. Please try again.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadHero()
    return () => {
      mounted = false
    }
  }, [heroId])

  const basicSkillImage = hero?.basicSkillImage || `/images/heroskill/${hero?.id}/basic.png`
  const skill1Image = hero?.skill1Image || `/images/heroskill/${hero?.id}/skill1.png`
  const skill2Image = hero?.skill2Image || `/images/heroskill/${hero?.id}/skill2.png`
  const passiveSkillImage = hero?.passiveSkillImage || `/images/heroskill/${hero?.id}/passive.png`

  useEffect(() => {
    if (!hero?.id) return
    const skillImages = [basicSkillImage, skill1Image, passiveSkillImage]
    if (hero.hasSkill2) skillImages.push(skill2Image)
    skillImages
      .filter(Boolean)
      .forEach((src) => {
        const img = new Image()
        img.src = src
        img.decoding = 'async'
      })
  }, [hero?.id, hero?.hasSkill2, basicSkillImage, skill1Image, skill2Image, passiveSkillImage])

  if (isLoading) {
    return (
      <section className="hero-detail">
        <h1>영웅 정보를 불러오는 중입니다.</h1>
        <Link to="/heroes" className="hero-back">영웅 목록으로</Link>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="hero-detail">
        <h1>{loadError}</h1>
        <Link to="/heroes" className="hero-back">영웅 목록으로</Link>
      </section>
    )
  }

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
                <img src={basicSkillImage} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
              </div>
              <div className="hero-skill-body">
                <h3>기본 공격</h3>
              </div>
            </div>
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={skill1Image} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
              </div>
              <div className="hero-skill-body">
                <h3>스킬 1</h3>
              </div>
            </div>
            {hero.hasSkill2 && (
              <div className="hero-skill-row">
                <div className="hero-skill-icon">
                  <img src={skill2Image} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
                </div>
                <div className="hero-skill-body">
                  <h3>스킬 2</h3>
                </div>
              </div>
            )}
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={passiveSkillImage} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
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
            : '추가로 내용을 업데이트할 예정입니다.'}
        </div>
      </section>
      <section className="hero-gear">
        <div className="hero-section-header">영웅 장비</div>
        <div className="hero-section-body">
          {hero.gear && hero.gear.length > 0
            ? hero.gear.join(', ')
            : '추가로 내용을 업데이트할 예정입니다.'}
        </div>
      </section>
      <section className="hero-comments">
        <div className="hero-section-header">댓글</div>
        <div className="hero-comments-body">
          <div className="hero-comment hero-comment--empty">
            댓글 기능은 현재 구현 보류 중입니다.
          </div>
        </div>
      </section>
    </section>
  )
}

export default HeroDetail
