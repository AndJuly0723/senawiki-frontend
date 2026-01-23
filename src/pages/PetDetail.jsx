import { Link, useParams } from 'react-router-dom'
import { pets } from '../data/pets'

function PetDetail() {
  const { petId } = useParams()
  const pet = pets.find((item) => item.id === petId)

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
              <div className="hero-skill-icon" />
              <div className="hero-skill-body">
                <h3>펫 스킬 (추가 예정)</h3>
                <p>설명 영역입니다. 추후 스킬 이미지와 텍스트를 채워주세요.</p>
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
