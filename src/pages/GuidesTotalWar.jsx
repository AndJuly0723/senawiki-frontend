import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DeckSkillOrder from '../components/DeckSkillOrder'
import { deleteGuideDeck, fetchGuideDeckEquipment, fetchGuideDecks, voteGuideDeck } from '../api/endpoints/guideDecks'
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
import { getAllHeroes, getAllPets } from '../utils/contentStorage'


function GuidesTotalWar() {
  const navigate = useNavigate()
  const [equipmentState, setEquipmentState] = useState({
    hero: null,
    data: null,
    isLoading: false,
    error: '',
  })
  const [currentUser, setCurrentUser] = useState(getStoredUser())
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null)
  const [writeNoticeOpen, setWriteNoticeOpen] = useState(false)
  const [voteNoticeOpen, setVoteNoticeOpen] = useState(false)
  const [voteNoticeMessage, setVoteNoticeMessage] = useState('')
  const [deleteConfirmDeck, setDeleteConfirmDeck] = useState(null)
  const [decks, setDecks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [votePendingDeckId, setVotePendingDeckId] = useState(null)
  const [activeTeamByDeck, setActiveTeamByDeck] = useState({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('likes')
  const [heroes, setHeroes] = useState([])
  const [pets, setPets] = useState([])
  const heroById = useMemo(() => new Map(heroes.map((hero) => [hero.id, hero])), [heroes])
  const heroByName = useMemo(() => new Map(heroes.map((hero) => [hero.name, hero])), [heroes])
  const petById = useMemo(() => new Map(pets.map((pet) => [pet.id, pet])), [pets])
  const petByName = useMemo(() => new Map(pets.map((pet) => [pet.name, pet])), [pets])

  useEffect(() => {
    let active = true
    Promise.all([getAllHeroes(), getAllPets()])
      .then(([heroList, petList]) => {
        if (!active) return
        setHeroes(heroList)
        setPets(petList)
      })
      .catch(() => {
        if (!active) return
        setHeroes([])
        setPets([])
      })
    return () => {
      active = false
    }
  }, [])

  const openVoteNotice = (message) => {
    setVoteNoticeMessage(message)
    setVoteNoticeOpen(true)
  }

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

  const requestDeleteDeck = (deck) => {
    if (!deck?.id) return
    setDeleteConfirmDeck(deck)
  }

  const handleDeleteDeck = async () => {
    const deck = deleteConfirmDeck
    if (!deck?.id) return
    try {
      await deleteGuideDeck(deck.id)
      setDecks((prev) => prev.filter((item) => item.id !== deck.id))
      setDeleteConfirmDeck(null)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '덱 삭제에 실패했습니다.'
      window.alert(message)
    }
  }

  const handleVoteDeck = async (deckId, voteType) => {
    if (deckId == null || deckId === '') {
      openVoteNotice('덱 정보를 다시 불러온 뒤 시도해 주세요.')
      return
    }
    if (votePendingDeckId === deckId) return
    const accessToken = getAccessToken()
    if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
      openVoteNotice('추천/비추천은 회원만 가능합니다.')
      return
    }
    setVotePendingDeckId(deckId)
    try {
      const data = await voteGuideDeck(deckId, voteType)
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                likes: data?.upVotes ?? deck.likes ?? 0,
                dislikes: data?.downVotes ?? deck.dislikes ?? 0,
              }
            : deck,
        ),
      )
    } catch (error) {
      const status = error?.response?.status
      if (status === 409) {
        openVoteNotice('이미 투표한 덱입니다.')
        return
      }
      if (status === 401) {
        openVoteNotice('로그인 후 이용 가능합니다.')
        return
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '투표 처리에 실패했습니다.'
      openVoteNotice(message)
    } finally {
      setVotePendingDeckId(null)
    }
  }

  useEffect(() => {
    let active = true
    setPage(1)
    setIsLoading(true)
    setLoadError('')
    fetchGuideDecks({ category: 'TOTAL_WAR', type: 'TOTAL_WAR' })
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
  }, [heroById, heroByName])

  useEffect(() => {
    setPage(1)
  }, [sortBy])

  const pageSize = 6
  const sortedDecks = useMemo(() => {
    const list = [...decks]
    if (sortBy === 'likes') {
      list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    } else if (sortBy === 'createdAt') {
      list.sort((a, b) => (b.createdAtTs ?? new Date(b.createdAt ?? 0).getTime()) - (a.createdAtTs ?? new Date(a.createdAt ?? 0).getTime()))
    }
    return list
  }, [decks, sortBy])
  const totalPages = Math.ceil(sortedDecks.length / pageSize)
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

  const getActiveTeamIndex = (deck) => {
    const teamCount = Array.isArray(deck?.teams) && deck.teams.length ? deck.teams.length : 1
    const selected = activeTeamByDeck[deck?.id] ?? 0
    return Math.max(0, Math.min(selected, teamCount - 1))
  }

  const getVisibleTeam = (deck) => {
    if (Array.isArray(deck?.teams) && deck.teams.length) {
      return deck.teams[getActiveTeamIndex(deck)] ?? deck.teams[0]
    }
    return {
      heroes: deck?.heroes ?? [],
      pet: deck?.pet ?? null,
      formationId: deck?.formationId ?? null,
      formationLabel: deck?.formationLabel ?? '',
      skillOrder: deck?.skillOrder ?? '',
      skillOrderItems: deck?.skillOrderItems ?? [],
    }
  }

  return (
    <section className="total-war-page">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>총력전</h1>
          <p className="community-title-note">총력전 공략덱 추가는 회원만 가능합니다. 덱 장비는 각 영웅을 클릭하여 확인하세요.</p>
        </div>
        <div className="community-actions">
          <div className="deck-sort">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="정렬">
              <option value="likes">추천순</option>
              <option value="createdAt">최신순</option>
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
              navigate('/guides/total-war/write')
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
              {Array.isArray(deck.teams) && deck.teams.length > 1 ? (
                <div className="deck-team-tabs">
                  {deck.teams.map((_, index) => (
                    <button
                      key={`${deck.id}-team-${index}`}
                      type="button"
                      className={`community-tab${getActiveTeamIndex(deck) === index ? ' is-active' : ''}`}
                      onClick={() =>
                        setActiveTeamByDeck((prev) => ({
                          ...prev,
                          [deck.id]: index,
                        }))
                      }
                    >
                      {index + 1}팀
                    </button>
                  ))}
                </div>
              ) : null}
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
                        className="community-action-item"
                        type="button"
                        onClick={() => {
                          setActionMenuOpenId(null)
                          navigate('/guides/total-war/write', {
                            state: { deckId: deck.id, editDeck: deck },
                          })
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="community-action-item community-action-item--danger"
                        type="button"
                        onClick={() => {
                          setActionMenuOpenId(null)
                          requestDeleteDeck(deck)
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
                      {getVisibleTeam(deck).heroes.map((heroKey, index) => {
                        const hero = heroById.get(heroKey) || heroByName.get(heroKey)
                        const backPositions = formationBackPositions[getVisibleTeam(deck).formationId] ?? []
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
                        const petKey = getVisibleTeam(deck).pet
                        const pet = petById.get(petKey) || petByName.get(petKey)
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
                    {getVisibleTeam(deck).formationLabel || formationLabelById[getVisibleTeam(deck).formationId] || ''}
                  </span>
                </div>
                <div className="deck-meta-row deck-meta-row--skill">
                  <span className="deck-meta-label">스킬순서</span>
                  <DeckSkillOrder
                    items={getVisibleTeam(deck).skillOrderItems}
                    text={getVisibleTeam(deck).skillOrder}
                  />
                </div>
              </div>
              <div className="deck-reactions">
                <button
                  className="deck-reaction-button"
                  type="button"
                  aria-label="추천"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleVoteDeck(deck.id, 'UP')
                  }}
                  disabled={votePendingDeckId !== null && votePendingDeckId === deck.id}
                >
                  <svg className="deck-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 10h4v10H2V10zm20 2c0-1.1-.9-2-2-2h-6.3l1-4.6.02-.22c0-.3-.12-.58-.32-.78L13.7 3 7.6 9.1c-.38.38-.6.9-.6 1.4V19c0 1.1.9 2 2 2h7c.82 0 1.54-.5 1.84-1.26l2.16-5.05c.06-.17.1-.34.1-.52v-2z" />
                  </svg>
                  <span>추천</span>
                  <span className="deck-reaction-count">{deck.likes}</span>
                </button>
                <button
                  className="deck-reaction-button deck-reaction-button--down"
                  type="button"
                  aria-label="비추천"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleVoteDeck(deck.id, 'DOWN')
                  }}
                  disabled={votePendingDeckId !== null && votePendingDeckId === deck.id}
                >
                  <svg className="deck-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 14h-4V4h4v10zM4 12c0 1.1.9 2 2 2h6.3l-1 4.6-.02.22c0 .3.12.58.32.78L12.3 21l6.1-6.1c.38-.38.6-.9.6-1.4V5c0-1.1-.9-2-2-2H10c-.82 0-1.54.5-1.84 1.26L6 9.31c-.06.17-.1.34-.1.52v2z" />
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
      {deleteConfirmDeck ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button
            className="community-modal-backdrop"
            type="button"
            onClick={() => setDeleteConfirmDeck(null)}
            aria-label="닫기"
          />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <h2>알림</h2>
            </div>
            <div className="community-modal-body">
              정말 삭제하시겠습니까?
            </div>
            <div className="community-modal-actions">
              <button
                className="community-modal-submit"
                type="button"
                onClick={handleDeleteDeck}
              >
                확인
              </button>
              <button
                className="community-modal-cancel"
                type="button"
                onClick={() => setDeleteConfirmDeck(null)}
              >
                취소
              </button>
            </div>
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
      {voteNoticeOpen ? (
        <div className="community-modal" role="dialog" aria-modal="true">
          <button
            className="community-modal-backdrop"
            type="button"
            onClick={() => setVoteNoticeOpen(false)}
            aria-label="닫기"
          />
          <div className="community-modal-card">
            <div className="community-modal-header">
              <h2>알림</h2>
            </div>
            <div className="community-modal-body">
              {voteNoticeMessage}
            </div>
            <div className="community-modal-actions">
              <button
                className="community-modal-cancel"
                type="button"
                onClick={() => setVoteNoticeOpen(false)}
              >
                확인
              </button>
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

export default GuidesTotalWar


