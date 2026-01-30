import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroes } from '../data/heroes'
import { pets } from '../data/pets'

const formationBackPositions = {
  basic: [1, 3, 5],
  balance: [2, 4],
  attack: [1, 2, 4, 5],
  protect: [3],
}

const adventureDecks = [
  {
    id: 'adventure-1',
    title: '불의 원소 던전 공략 덱',
    author: '관리자',
    skillOrder: '비스킷1-헤브니아1-유이1-스파이크1-스파이크2-유이2',
    createdAt: '2026-01-25',
    likes: 12,
    dislikes: 1,
    heroes: ['유이', '헤브니아', '라이언', '스파이크', '비스킷'],
    pet: '윈디',
    formation: {
      id: 'balance',
      label: '밸런스진형',
    },
  },
  {
    id: 'adventure-2',
    title: '불의 원소 던전 공략 덱',
    author: '관리자',
    skillOrder: '비스킷1-스파이크1-스파이크2-유이1-라니아1-헤브니아1-라니아2',
    createdAt: '2026-01-24',
    likes: 8,
    dislikes: 2,
    heroes: ['유이', '라니아', '스파이크', '헤브니아', '비스킷'],
    pet: '윈디',
    formation: {
      id: 'protect',
      label: '보호진형',
    },
  },
  {
    id: 'adventure-3',
    title: '불의 원소 던전 공략 덱',
    author: '관리자',
    skillOrder: '비스킷1-헤브니아1-유이1-스파이크1-스파이크2-유이2',
    createdAt: '2026-01-23',
    likes: 6,
    dislikes: 1,
    heroes: ['유이', '헤브니아', '라이언', '스파이크', '비스킷'],
    pet: '윈디',
    formation: {
      id: 'basic',
      label: '기본진형',
    },
  },
  {
    id: 'adventure-4',
    title: '불의 원소 던전 공략 덱',
    author: '관리자',
    skillOrder: '비스킷1-헤브니아1-유이1-스파이크1-스파이크2-유이2',
    createdAt: '2026-01-22',
    likes: 5,
    dislikes: 0,
    heroes: ['유이', '헤브니아', '라이언', '스파이크', '비스킷'],
    pet: '윈디',
    formation: {
      id: 'attack',
      label: '공격진형',
    },
  },
]

function GuidesAdventure() {
  const [equipmentHero, setEquipmentHero] = useState(null)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('likes')
  const heroByName = useMemo(() => new Map(heroes.map((hero) => [hero.name, hero])), [])
  const petByName = useMemo(() => new Map(pets.map((pet) => [pet.name, pet])), [])

  useEffect(() => {
    setEquipmentHero(null)
    setPage(1)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [sortBy])

  const pageSize = 6
  const sortedDecks = useMemo(() => {
    const list = [...adventureDecks]
    if (sortBy === 'likes') {
      list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    } else if (sortBy === 'createdAt') {
      list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    }
    return list
  }, [sortBy])
  const totalPages = Math.ceil(sortedDecks.length / pageSize)
  const currentPage = Math.min(page, Math.max(totalPages, 1))
  const pagedDecks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedDecks.slice(start, start + pageSize)
  }, [sortedDecks, currentPage])

  return (
    <section className="adventure-page">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>모험</h1>
          <p>모험 공략덱 추가는 회원만 가능합니다.</p>
        </div>
        <div className="community-actions">
          <div className="deck-sort">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="정렬">
              <option value="likes">추천순</option>
              <option value="createdAt">등록일순</option>
            </select>
          </div>
          <Link className="community-icon-button" to="/guides/adventure/write" aria-label="글쓰기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25z" />
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </Link>
        </div>
      </div>
      <div className="deck-list">
        {pagedDecks.map((deck) => (
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
                        <button
                          key={name}
                          type="button"
                          className={`deck-unit deck-unit-button${isBack ? ' is-back' : ''}`}
                          onClick={() => setEquipmentHero(hero)}
                          aria-label={`${hero.name} 장비 보기`}
                        >
                          <img src={hero.image} alt={hero.name} />
                          <span>{hero.name}</span>
                        </button>
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
            <div className="deck-meta">
              <div className="deck-meta-row">
                <span className="deck-meta-label">작성자</span>
                <span className="deck-meta-value">{deck.author}</span>
              </div>
              <div className="deck-meta-row">
                <span className="deck-meta-label">진형</span>
                <span className="deck-meta-value">{deck.formation.label}</span>
              </div>
              <div className="deck-meta-row deck-meta-row--skill">
                <span className="deck-meta-label">스킬순서</span>
                <span className="deck-meta-value deck-meta-value--skill">{deck.skillOrder}</span>
              </div>
            </div>
            <div className="deck-reactions">
              <button className="deck-reaction-button" type="button" aria-label="추천">
                <svg className="deck-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 10h4v10H2V10zm20 2c0-1.1-.9-2-2-2h-6.3l1-4.6.02-.22c0-.3-.12-.58-.32-.78L13.7 3 7.6 9.1c-.38.38-.6.9-.6 1.4V19c0 1.1.9 2 2 2h7c.82 0 1.54-.5 1.84-1.26l2.16-5.05c.06-.17.1-.34.1-.52v-2z" />
                </svg>
                <span>추천</span>
                <span className="deck-reaction-count">{deck.likes}</span>
              </button>
              <button className="deck-reaction-button deck-reaction-button--down" type="button" aria-label="비추천">
                <svg className="deck-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 14h-4V4h4v10zM4 12c0 1.1.9 2 2 2h6.3l-1 4.6-.02.22c0 .3.12.58.32.78L12.3 21l6.1-6.1c.38-.38.6-.9.6-1.4V5c0-1.1-.9-2-2-2H10c-.82 0-1.54.5-1.84 1.26L6 9.31c-.06.17-.1.34-.1.52v2z" />
                </svg>
                <span>비추천</span>
                <span className="deck-reaction-count">{deck.dislikes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {equipmentHero ? (
        <div className="equipment-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="equipment-modal-backdrop"
            aria-label="닫기"
            onClick={() => setEquipmentHero(null)}
          />
          <div className="equipment-modal-card" role="document">
            <div className="equipment-modal-header">
              <div>
                <h2>{equipmentHero.name}</h2>
                <p>장비 세트: 성기사 세트</p>
              </div>
              <button
                type="button"
                className="equipment-modal-close"
                onClick={() => setEquipmentHero(null)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="equipment-grid">
              <div className="equipment-slot">
                <span className="equipment-slot-label">무기 1</span>
                <span className="equipment-slot-value">주옵 : 생명력(%)</span>
                <span className="equipment-slot-sub">부옵 : 치피 · 치확</span>
              </div>
              <div className="equipment-slot">
                <span className="equipment-slot-label">방어구 1</span>
                <span className="equipment-slot-value">주옵 : 생명력(%)</span>
                <span className="equipment-slot-sub">부옵 : 치피 · 치확</span>
              </div>
              <div className="equipment-slot">
                <span className="equipment-slot-label">무기 2</span>
                <span className="equipment-slot-value">주옵 : 생명력(%)</span>
                <span className="equipment-slot-sub">부옵 : 치피 · 치확</span>
              </div>
              <div className="equipment-slot">
                <span className="equipment-slot-label">방어구 2</span>
                <span className="equipment-slot-value">주옵 : 생명력(%)</span>
                <span className="equipment-slot-sub">부옵 : 치피 · 치확</span>
              </div>
              <div className="equipment-slot equipment-slot--ring">
                <span className="equipment-slot-label">반지</span>
                <span className="equipment-slot-value">빙결반지</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {totalPages > 1 ? (
        <div className="deck-pagination">
          <button
            className="deck-page-button deck-page-button--nav"
            type="button"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            {'<<'}
          </button>
          <button
            className="deck-page-button deck-page-button--nav"
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            {'<'}
          </button>
          <div className="deck-pagination-pages">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  className={`deck-page-button${pageNumber === currentPage ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>
          <button
            className="deck-page-button deck-page-button--nav"
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            {'>'}
          </button>
          <button
            className="deck-page-button deck-page-button--nav"
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            {'>>'}
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default GuidesAdventure
