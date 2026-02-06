import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { heroes } from '../data/heroes'
import { pets } from '../data/pets'
import { deleteGuideDeck, fetchGuideDeckEquipment, fetchGuideDecks } from '../api/endpoints/guideDecks'
import {
  equipmentSlots,
  formatGuideDeckDate,
  formationBackPositions,
  formationLabelById,
  normalizeEquipmentResponse,
  normalizeGuideDeckList,
} from '../utils/guideDecks'
import { getStoredUser, isAdminUser } from '../utils/authStorage'
import { getAccessToken } from '../utils/authStorage'

const stageMeta = {
  fire: '불의 원소 던전',
  water: '물의 원소 던전',
  earth: '땅의 원소 던전',
  light: '빛의 원소 던전',
  dark: '암흑의 원소 던전',
  gold: '골드 던전',
}

function GuidesGrowthStage() {
  const { stageId } = useParams()
  const [equipmentState, setEquipmentState] = useState({
    hero: null,
    data: null,
    isLoading: false,
    error: '',
  })
  const [currentUser, setCurrentUser] = useState(getStoredUser())
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null)
  const [writeNoticeOpen, setWriteNoticeOpen] = useState(false)
  const [decks, setDecks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [sortBy, setSortBy] = useState('likes')
  const [page, setPage] = useState(1)
  const label = stageMeta[stageId] ?? '성장던전'
  const heroById = useMemo(() => new Map(heroes.map((hero) => [hero.id, hero])), [])
  const heroByName = useMemo(() => new Map(heroes.map((hero) => [hero.name, hero])), [])
  const petById = useMemo(() => new Map(pets.map((pet) => [pet.id, pet])), [])
  const petByName = useMemo(() => new Map(pets.map((pet) => [pet.name, pet])), [])

  useEffect(() => {
    const handleAuthChange = () => setCurrentUser(getStoredUser())
    window.addEventListener('authchange', handleAuthChange)
    return () => window.removeEventListener('authchange', handleAuthChange)
  }, [])

  useEffect(() => {
    const handleDocClick = (event) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('.deck-card-actions')) return
      setActionMenuOpenId(null)
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [])

  const getUserDisplayName = (user) =>
    user?.nickname ||
    user?.name ||
    user?.userName ||
    user?.username ||
    user?.login ||
    ''

  const canManageDeck = (deck) => {
    if (!currentUser) return false
    if (isAdminUser(currentUser)) return true
    const userName = getUserDisplayName(currentUser).trim()
    return Boolean(userName && deck?.author && userName === String(deck.author).trim())
  }

  const handleDeleteDeck = async (deck) => {
    if (!deck?.id) return
    if (!window.confirm('정말 삭제할까요?')) return
    try {
      await deleteGuideDeck(deck.id)
      setDecks((prev) => prev.filter((item) => item.id !== deck.id))
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '덱 삭제에 실패했습니다.'
      window.alert(message)
    }
  }

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setLoadError('')
    setPage(1)
    fetchGuideDecks({ category: 'GROWTH', type: 'GROWTH', stageId })
      .then((data) => {
        if (!active) return
        setDecks(normalizeGuideDeckList(data, heroById, heroByName))
      })
      .catch((error) => {
        if (!active) return
        const message =
          error?.response?.data?.message ||
          error?.message ||
          '덱 목록을 불러오지 못했습니다.'
        setLoadError(message)
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [stageId, heroById, heroByName])

  const pageSize = 6
  const sortedDecks = useMemo(() => {
    const list = [...decks]
    if (sortBy === 'likes') {
      list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    } else if (sortBy === 'createdAt') {
      list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    }
    return list
  }, [decks, sortBy])
  const totalPages = Math.ceil(sortedDecks.length / pageSize)

  useEffect(() => {
    setPage(1)
    setEquipmentState({
      hero: null,
      data: null,
      isLoading: false,
      error: '',
    })
  }, [stageId])

  useEffect(() => {
    setPage(1)
  }, [sortBy])

  const currentPage = Math.min(page, Math.max(totalPages, 1))
  const pagedDecks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedDecks.slice(start, start + pageSize)
  }, [sortedDecks, currentPage])

  const handleCloseEquipmentModal = () => {
    setEquipmentState({
      hero: null,
      data: null,
      isLoading: false,
      error: '',
    })
  }

  const handleOpenEquipmentModal = async (deckId, heroKey) => {
    const hero = heroById.get(heroKey) || heroByName.get(heroKey)
    if (!hero) return
    setEquipmentState({
      hero,
      data: null,
      isLoading: true,
      error: '',
    })
    try {
      const data = await fetchGuideDeckEquipment(deckId, hero.id)
      setEquipmentState({
        hero,
        data: normalizeEquipmentResponse(data),
        isLoading: false,
        error: '',
      })
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '장비 정보를 불러오지 못했습니다.'
      setEquipmentState({
        hero,
        data: null,
        isLoading: false,
        error: message,
      })
    }
  }

  return (
    <section className="growth-stage">
      <Link to="/guides/growth-dungeon" className="hero-back">← 성장던전</Link>
      <div className="community-toolbar">
        <div className="community-title">
          <h1>{label}</h1>
          <p className="community-title-note">해당 던전의 공략덱 추가는 회원만 가능합니다. 덱 장비는 각 영웅을 클릭하여 확인하세요.</p>
        </div>
        <div className="community-actions">
          <div className="deck-sort">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="정렬">
              <option value="likes">추천순</option>
              <option value="createdAt">등록일순</option>
            </select>
          </div>
          <button
            className="community-icon-button"
            type="button"
            aria-label="글쓰기"
            onClick={() => {
              if (!getAccessToken()) {
                setWriteNoticeOpen(true)
                return
              }
              window.location.href = `/guides/growth-dungeon/${stageId}/write`
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25z" />
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="deck-list">
        {isLoading ? (
          <div className="deck-empty">덱 목록을 불러오는 중입니다.</div>
        ) : loadError ? (
          <div className="deck-empty">{loadError}</div>
        ) : pagedDecks.length === 0 ? (
          <div className="deck-empty">등록된 덱이 없습니다.</div>
        ) : (
          pagedDecks.map((deck) => (
            <div key={deck.id} className="deck-card">
              {canManageDeck(deck) ? (
                <div className="deck-card-actions">
                  <button
                    className="community-action-button"
                    type="button"
                    aria-label="덱 관리"
                    onClick={(event) => {
                      event.stopPropagation()
                      setActionMenuOpenId((prev) => (prev === deck.id ? null : deck.id))
                    }}
                  >
                    <span className="community-action-dot" />
                    <span className="community-action-dot" />
                    <span className="community-action-dot" />
                  </button>
                  {actionMenuOpenId === deck.id ? (
                    <div className="community-action-menu" role="menu">
                      <button
                        className="community-action-item community-action-item--danger"
                        type="button"
                        onClick={() => {
                          setActionMenuOpenId(null)
                          handleDeleteDeck(deck)
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="deck-head" aria-hidden="true" />
              <div className="deck-layout">
                <div className="deck-center">
                  <div className="deck-row">
                    <div className="deck-units deck-units--lineup">
                      {deck.heroes.map((heroKey, index) => {
                        const hero = heroById.get(heroKey) || heroByName.get(heroKey)
                        const backPositions = formationBackPositions[deck.formationId] ?? []
                        const isBack = backPositions.includes(index + 1)
                        return hero ? (
                          <button
                            key={`${deck.id}-${hero.id}-${index}`}
                            type="button"
                            className={`deck-unit deck-unit-button${isBack ? ' is-back' : ''}`}
                            onClick={() => handleOpenEquipmentModal(deck.id, hero.id)}
                            aria-label={`${hero.name} 장비 보기`}
                          >
                            <img src={hero.image} alt={hero.name} />
                            <span>{hero.name}</span>
                          </button>
                        ) : null
                      })}
                      {(() => {
                        const pet = petById.get(deck.pet) || petByName.get(deck.pet)
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
                  <span className="deck-meta-label">작성일</span>
                  <span className="deck-meta-value">{formatGuideDeckDate(deck.createdAt)}</span>
                </div>
                <div className="deck-meta-row">
                  <span className="deck-meta-label">진형</span>
                  <span className="deck-meta-value">
                    {deck.formationLabel || formationLabelById[deck.formationId] || ''}
                  </span>
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
                    <path d="M22 14h-4V4h4v10zM4 12c0 1.1.9 2 2 2h6.3l-1 4.6-.02.22c0 .3.12.58.32.78L12.3 21l6.1-6.1c.38-.38.6-.9.6-1.4V5c0-1.1-.9-2-2-2H10c-.82 0-1.54.5-1.84 1.26L6 9.31c-.06.17-.1-.34-.1-.52v2z" />
                  </svg>
                  <span>비추천</span>
                  <span className="deck-reaction-count">{deck.dislikes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {equipmentState.hero ? (
        <div className="equipment-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="equipment-modal-backdrop"
            aria-label="닫기"
            onClick={handleCloseEquipmentModal}
          />
          <div className="equipment-modal-card equipment-modal-card--view" role="document">
            <div className="equipment-modal-header">
              <div>
                <h2>{equipmentState.hero.name}</h2>
                <p>{equipmentState.isLoading ? '장비 정보를 불러오는 중...' : '장비 정보'}</p>
              </div>
              <div className="equipment-modal-header-right">
                <div className="equipment-modal-controls equipment-modal-summary">
                  <div className="equipment-summary-field">
                    <span>장비 세트</span>
                    <strong>
                      {equipmentState.isLoading ? '-' : equipmentState.data?.setName || '-'}
                    </strong>
                  </div>
                  <div className="equipment-summary-field">
                    <span>반지</span>
                    <strong>
                      {equipmentState.isLoading ? '-' : equipmentState.data?.ring || '-'}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="equipment-modal-close"
                  onClick={handleCloseEquipmentModal}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
            </div>
            {equipmentState.error ? (
              <div className="deck-empty">{equipmentState.error}</div>
            ) : (
              <div className="equipment-grid equipment-grid--tile">
                {equipmentSlots.map((slot) => {
                  const slotData = equipmentState.data?.slots?.[slot.id]
                  const subText = slotData?.subs?.length ? slotData.subs.join(' · ') : ''
                  return (
                    <div key={slot.id} className="equipment-slot">
                      <span className="equipment-slot-label">{slot.label}</span>
                      <span className="equipment-slot-value">
                        {slotData?.main ? `주옵 : ${slotData.main}` : '주옵 : -'}
                      </span>
                      <span className="equipment-slot-sub">
                        {subText ? `부옵 : ${subText}` : '부옵 : -'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
      {writeNoticeOpen ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button
            className="community-modal-backdrop"
            type="button"
            onClick={() => setWriteNoticeOpen(false)}
            aria-label="닫기"
          />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <h2>알림</h2>
            </div>
            <div className="community-modal-body">
              공략덱 작성은 회원만 가능합니다.
            </div>
            <div className="community-modal-actions">
              <button
                className="community-modal-cancel"
                type="button"
                onClick={() => setWriteNoticeOpen(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default GuidesGrowthStage

