import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPetById } from '../utils/contentStorage'

function PetDetail() {
  const { petId } = useParams()
  const [pet, setPet] = useState(null)

  useEffect(() => {
    let mounted = true
    const loadPet = async () => {
      const result = await getPetById(petId)
      if (mounted) setPet(result ?? null)
    }
    loadPet()
    return () => {
      mounted = false
    }
  }, [petId])

  const skillImage = pet?.skillImage || `/images/petskill/${pet?.id}/skill.png`

  const resolvePetTargets = () => {
    if (pet?.skill?.targets) {
      return pet.skill.targets
    }
    if (pet?.skill?.target) {
      return [pet.skill.target]
    }
    return []
  }

  const renderPetSkillLine = (line, target, index) => (
    <span key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {target ? (
        <span
          className={`pet-skill-target ${
            target === '모든 적군' ? 'pet-skill-target--enemy' : 'pet-skill-target--ally'
          }`}
        >
          [{target}]
        </span>
      ) : null}
      {target ? ' ' : ''}
      {line}
    </span>
  )

  if (!pet) {
    return (
      <section className="hero-detail">
        <h1>펫을 찾을 수 없습니다</h1>
        <Link to="/pets" className="hero-back">펫 목록으로</Link>
      </section>
    )
  }

  return (
    <section className={`hero-detail hero-detail--${pet.grade}`}>
      <Link to="/pets" className="hero-back">← 펫 목록</Link>
      <div className="hero-detail-layout">
        <aside className="hero-profile">
          <div className="hero-profile-header">
            <h1>{pet.name}</h1>
          </div>
          <div className="hero-profile-image">
            <img src={pet.image} alt={pet.name} />
          </div>
          <div className="hero-profile-meta">
            <div className="hero-meta-row">
              <span>별명</span>
              <strong>{pet.nickname ?? '추가 예정'}</strong>
            </div>
            <div className="hero-meta-row">
              <span>획득 경로</span>
              <strong>{pet.acquisition && pet.acquisition.length > 0 ? pet.acquisition.join(', ') : '모험·소환, 합성'}</strong>
            </div>
          </div>
        </aside>
        <div className="hero-detail-main">
          <section className="hero-skills">
            <div className="hero-skills-header">스킬</div>
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={skillImage} alt="" aria-hidden="true" />
              </div>
              <div className="hero-skill-body">
                <h3>
                  {pet.skill?.name ?? '펫의 응원'}
                </h3>
                {pet.skill?.descriptionLines ? (
                  <p>
                    {(() => {
                      const targets = resolvePetTargets()
                      if (targets.length === pet.skill.descriptionLines.length) {
                        return pet.skill.descriptionLines.map((line, index) =>
                          renderPetSkillLine(line, targets[index], index),
                        )
                      }
                      if (targets.length === 1) {
                        return pet.skill.descriptionLines.map((line, index) =>
                          renderPetSkillLine(line, targets[0], index),
                        )
                      }
                      return pet.skill.descriptionLines.map((line, index) =>
                        renderPetSkillLine(line, '', index),
                      )
                    })()}
                  </p>
                ) : pet.skill?.description ? (
                  <p>
                    {(() => {
                      const targets = resolvePetTargets()
                      return targets.length > 0 ? (
                        <>
                          <span
                            className={`pet-skill-target ${
                              targets[0] === '모든 적군'
                                ? 'pet-skill-target--enemy'
                                : 'pet-skill-target--ally'
                            }`}
                          >
                            [{targets[0]}]
                          </span>{' '}
                          {pet.skill.description}
                        </>
                      ) : (
                        pet.skill.description
                      )
                    })()}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
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

export default PetDetail

