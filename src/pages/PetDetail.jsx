import { Link, useParams } from 'react-router-dom'
import { pets } from '../data/pets'

function PetDetail() {
  const { petId } = useParams()
  const pet = pets.find((item) => item.id === petId)
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
              <strong>추가 예정</strong>
            </div>
            <div className="hero-meta-row">
              <span>획득 경로</span>
              <strong>추가 예정</strong>
            </div>
          </div>
        </aside>
        <div className="hero-detail-main">
          <section className="hero-skills">
            <div className="hero-skills-header">스킬</div>
            <div className="hero-skill-row">
              <div className="hero-skill-icon">
                <img src={`/images/petskill/${pet.id}/skill.png`} alt="" aria-hidden="true" />
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
      <section className="hero-content">
        <div className="hero-section-header">펫 사용 콘텐츠</div>
        <div className="hero-section-body">
          추후 내용을 추가할 예정입니다.
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
          <div className="hero-comment-form">
            <textarea placeholder="댓글을 입력하세요." rows="3" />
            <button type="button">등록</button>
          </div>
        </div>
      </section>
    </section>
  )
}

export default PetDetail
