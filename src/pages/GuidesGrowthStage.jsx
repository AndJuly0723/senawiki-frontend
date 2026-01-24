import { useParams, Link } from 'react-router-dom'
import { heroes } from '../data/heroes'
import { pets } from '../data/pets'

const stageMeta = {
  fire: '불의 원소 던전',
  water: '물의 원소 던전',
  earth: '땅의 원소 던전',
  light: '빛의 원소 던전',
  dark: '암흑의 원소 던전',
  gold: '골드 던전',
}

const formationBackPositions = {
  basic: [1, 3, 5],
  balance: [2, 4],
  attack: [1, 2, 4, 5],
  protect: [3],
}

function GuidesGrowthStage() {
  const { stageId } = useParams()
  const label = stageMeta[stageId] ?? '성장던전'
  const heroByName = new Map(heroes.map((hero) => [hero.name, hero]))
  const petByName = new Map(pets.map((pet) => [pet.name, pet]))

  const decksByStage = {
    fire: [
      {
        id: 'fire-1',
        title: '불의 원소 던전 공략 덱',
        heroes: ['유이', '헤브니아', '라이언', '스파이크', '비스킷'],
        pet: '윈디',
        formation: {
          id: 'balance',
          image: '/images/formation/balance.png',
        },
      },
    ],
  }

  const decks = decksByStage[stageId] ?? []

  return (
    <section className="growth-stage">
      <Link to="/guides/growth-dungeon" className="hero-back">← 성장던전</Link>
      <h1>{label}</h1>
      <p>해당 스테이지 공략 내용을 추가해주세요.</p>
      <div className="deck-list">
        {decks.length === 0 ? (
          <div className="deck-empty">등록된 덱이 없습니다.</div>
        ) : (
          decks.map((deck) => (
            <div key={deck.id} className="deck-card">
              <div className="deck-head" aria-hidden="true" />
              <div className="deck-layout">
                <div className="deck-center">
                  <div className="deck-row">
                    <div className="deck-units deck-units--lineup">
                      {deck.heroes.map((name, index) => {
                        const hero = heroByName.get(name)
                        const backPositions = formationBackPositions[deck.formation.id] ?? []
                        const isBack = backPositions.includes(index + 1)
                        return hero ? (
                          <div key={name} className={`deck-unit${isBack ? ' is-back' : ''}`}>
                            <img src={hero.image} alt={hero.name} />
                            <span>{hero.name}</span>
                          </div>
                        ) : null
                      })}
                      {(() => {
                        const pet = petByName.get(deck.pet)
                        return pet ? (
                          <div className="deck-unit deck-unit--pet">
                            <img src={pet.image} alt={pet.name} />
                            <span>{pet.name}</span>
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="deck-skill-order">
                <span className="deck-row-label">스킬 순서</span>
                <div className="deck-skill-content"></div>
              </div>
              <div className="deck-formation-note">
                진형: {deck.formation.label}
                <br />
                스킬 순서:
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default GuidesGrowthStage
