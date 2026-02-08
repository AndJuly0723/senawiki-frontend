import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { heroes } from '../data/heroes'
import { pets } from '../data/pets'
import { createGuideDeck } from '../api/endpoints/guideDecks'
import { equipmentSlots, formationBackPositions, formationOptions } from '../utils/guideDecks'
import { getAccessToken } from '../utils/authStorage'

const raidMeta = {
  'ruin-eye': '파멸의 눈동자',
  'bull-demon-king': '우마왕',
  'iron-devourer': '강철의 포식자',
}

const stageMeta = {
  fire: '불의 원소 던전',
  water: '물의 원소 던전',
  earth: '땅의 원소 던전',
  light: '빛의 원소 던전',
  dark: '암흑의 원소 던전',
  gold: '골드 던전',
}

const weaponMainOptions = [
  '약공 확률',
  '치명타 확률',
  '치명타 피해',
  '모든 공격력(%)',
  '방어력(%)',
  '생명력(%)',
  '효과 적중',
]

const armorMainOptions = [
  '받는 피해 감소',
  '막기 확률',
  '모든 공격력(%)',
  '방어력(%)',
  '생명력(%)',
  '효과 저항',
]

const subOptions = [
  '모든 공격력(%)',
  '방어력(%)',
  '생명력(%)',
  '속공',
  '치확',
  '치피',
  '약공 확률',
  '막기 확률',
  '효적',
  '효저',
]

const ringOptions = [
  '부활반지',
  '불사반지',
  '권능반지',
  '토벌반지',
  '공성반지',
  '섬멸반지',
  '기절반지',
  '침묵반지',
  '즉사반지',
  '마비반지',
  '감전반지',
  '실명반지',
  '빙결반지',
  '석화반지',
  '수면반지',
  '출혈반지',
  '화상반지',
  '중독반지',
  '피증반지',
  '방어력반지',
  '치확반지',
  '막기반지',
  '약공반지',
  '생명력반지',
  '효적반지',
  '효저반지',
]

const equipmentSetOptions = [
  '선봉장세트',
  '추적자세트',
  '성기사세트',
  '수문장세트',
  '수호자세트',
  '암살자세트',
  '복수자세트',
  '주술사세트',
  '조율자세트',
]

const siegeDayEnumBySlug = {
  mon: 'MON',
  tue: 'TUE',
  wed: 'WED',
  thu: 'THU',
  fri: 'FRI',
  sat: 'SAT',
  sun: 'SUN',
}

function DeckSlot({ children, isBack, filled, isActive, isInvalid, isDisabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`deck-unit${filled ? '' : ' deck-unit--placeholder'}${isBack ? ' is-back' : ''}${isActive ? ' is-active' : ''}${isInvalid ? ' is-invalid' : ''}${isDisabled ? ' is-disabled' : ''}`}
      disabled={isDisabled}
    >
      {children}
    </button>
  )
}

function GuidesDeckWrite({ mode }) {
  const { raidId, stageId, day } = useParams()
  const navigate = useNavigate()
  const isAdventureMode = mode === 'adventure'
  const isTotalWarMode = mode === 'total-war'
  const isGuildWarMode = mode === 'guild-war'
  const isMultiTeamMode = isAdventureMode || isTotalWarMode
  const teamCount = isAdventureMode ? 2 : isTotalWarMode ? 5 : 1
  const heroSlotCount = 5
  const requiredHeroCount = isGuildWarMode ? 3 : heroSlotCount

  let label = '공략'
  let backTo = '/'
  let note = '공략덱 작성은 회원만 가능합니다.'

  if (mode === 'adventure') {
    label = '모험'
    backTo = '/guides/adventure'
  } else if (mode === 'arena') {
    label = '결투장'
    backTo = '/guides/arena'
  } else if (mode === 'total-war') {
    label = '총력전'
    backTo = '/guides/total-war'
  } else if (mode === 'raid') {
    label = raidMeta[raidId] ?? '레이드'
    backTo = `/guides/raid/${raidId ?? ''}`.replace(/\/$/, '')
  } else if (mode === 'growth') {
    label = stageMeta[stageId] ?? '성장던전'
    backTo = `/guides/growth-dungeon/${stageId ?? ''}`.replace(/\/$/, '')
  } else if (mode === 'siege') {
    label = '공성전'
    backTo = `/guild/siege/${day ?? ''}`.replace(/\/$/, '')
  } else if (mode === 'guild-war') {
    label = '길드전'
    backTo = '/guild/guild-war'
  }

  const createEmptyEquipment = () =>
    equipmentSlots.reduce((acc, slot) => {
      acc[slot.id] = { main: '', subs: [] }
      return acc
    }, {})

  const createEmptySlot = () => ({
    equipment: createEmptyEquipment(),
    ring: '',
    set: '',
  })
  const createEmptyTeamState = () => ({
    formationId: formationOptions[0].id,
    equipmentBySlot: Array.from({ length: heroSlotCount }, () => createEmptySlot()),
    selectedHeroes: Array(heroSlotCount).fill(null),
    selectedPet: null,
    heroQuery: '',
    petQuery: '',
    activeHeroSlot: null,
    isPetSlotActive: false,
    skillOrder: [],
    invalidSubSlots: [],
    invalidEquipSlots: [],
  })

  const [activeTeamIndex, setActiveTeamIndex] = useState(0)
  const [teamStates, setTeamStates] = useState(() =>
    Array.from({ length: teamCount }, () => createEmptyTeamState()),
  )
  const [equipmentModalState, setEquipmentModalState] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const currentTeam = teamStates[activeTeamIndex]
  const backPositions = formationBackPositions[currentTeam?.formationId] ?? []

  const heroById = useMemo(() => new Map(heroes.map((hero) => [hero.id, hero])), [])
  const petById = useMemo(() => new Map(pets.map((pet) => [pet.id, pet])), [])
  
  const activeEquipmentSlot =
    equipmentModalState !== null
      ? teamStates[equipmentModalState.teamIndex]?.equipmentBySlot[equipmentModalState.slotIndex]
      : null

  const activeHero =
    equipmentModalState !== null
      ? heroById.get(teamStates[equipmentModalState.teamIndex]?.selectedHeroes[equipmentModalState.slotIndex])
      : null
  const filteredHeroes = useMemo(() => {
    const query = (currentTeam?.heroQuery ?? '').trim().toLowerCase()
    if (!query) return heroes
    return heroes.filter((hero) => hero.name.toLowerCase().includes(query))
  }, [currentTeam?.heroQuery])

  const filteredPets = useMemo(() => {
    const query = (currentTeam?.petQuery ?? '').trim().toLowerCase()
    if (!query) return pets
    return pets.filter((pet) => pet.name.toLowerCase().includes(query))
  }, [currentTeam?.petQuery])

  const updateCurrentTeam = (updater) => {
    setTeamStates((prev) =>
      prev.map((team, index) => (index === activeTeamIndex ? updater(team) : team)),
    )
  }
  const updateTeamByIndex = (teamIndex, updater) => {
    setTeamStates((prev) =>
      prev.map((team, index) => (index === teamIndex ? updater(team) : team)),
    )
  }

  const handleSelectHero = (heroId) => {
    if (!heroId) return
    updateCurrentTeam((team) => {
      const existingIndex = team.selectedHeroes.findIndex((id) => id === heroId)
      if (existingIndex !== -1) {
        return team
      }
      if (team.activeHeroSlot === null) {
        return team
      }
      const selectedCount = team.selectedHeroes.filter(Boolean).length
      if (isGuildWarMode && selectedCount >= requiredHeroCount && !team.selectedHeroes[team.activeHeroSlot]) {
        return {
          ...team,
          activeHeroSlot: null,
          heroQuery: '',
        }
      }
      const next = [...team.selectedHeroes]
      next[team.activeHeroSlot] = heroId
      return {
        ...team,
        selectedHeroes: next,
        activeHeroSlot: null,
        heroQuery: '',
      }
    })
  }
  const handleSelectPet = (petId) => {
    if (!petId) return
    if (!currentTeam?.isPetSlotActive) return
    updateCurrentTeam((team) => ({
      ...team,
      selectedPet: petId,
      isPetSlotActive: false,
      petQuery: '',
    }))
  }
  const handleHeroSlotClick = (index) => {
    const heroId = currentTeam?.selectedHeroes[index]
    const selectedCount = (currentTeam?.selectedHeroes ?? []).filter(Boolean).length
    if (heroId) {
      setEquipmentModalState({ teamIndex: activeTeamIndex, slotIndex: index })
      updateCurrentTeam((team) => ({
        ...team,
        activeHeroSlot: null,
        heroQuery: '',
        isPetSlotActive: false,
        petQuery: '',
      }))
      return
    }
    if (isGuildWarMode && selectedCount >= requiredHeroCount) return
    updateCurrentTeam((team) => ({
      ...team,
      activeHeroSlot: index,
      isPetSlotActive: false,
      petQuery: '',
    }))
  }
  const handlePetSlotClick = () => {
    if (currentTeam?.selectedPet) {
      updateCurrentTeam((team) => ({
        ...team,
        selectedPet: null,
        isPetSlotActive: false,
        petQuery: '',
      }))
      return
    }
    updateCurrentTeam((team) => ({
      ...team,
      isPetSlotActive: true,
      activeHeroSlot: null,
      heroQuery: '',
    }))
  }
  useEffect(() => {
    const handleDocClick = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('.deck-units--write') || target.closest('.deck-write-picker')) return
      setTeamStates((prev) =>
        prev.map((team, index) =>
          index === activeTeamIndex
            ? {
                ...team,
                activeHeroSlot: null,
                heroQuery: '',
                isPetSlotActive: false,
                petQuery: '',
              }
            : team,
        ),
      )
    }

    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [activeTeamIndex])

  const handleCloseEquipmentModal = () => setEquipmentModalState(null)

  const handleRemoveHero = (teamIndex, index) => {
    updateTeamByIndex(teamIndex, (team) => {
      const nextHeroes = [...team.selectedHeroes]
      nextHeroes[index] = null
      const nextEquipments = [...team.equipmentBySlot]
      nextEquipments[index] = createEmptySlot()
      return {
        ...team,
        selectedHeroes: nextHeroes,
        equipmentBySlot: nextEquipments,
      }
    })
    setEquipmentModalState(null)
  }

  const handleEquipmentMainChange = (teamIndex, index, slotId, value) => {
    updateTeamByIndex(teamIndex, (team) => ({
      ...team,
      equipmentBySlot: team.equipmentBySlot.map((slot, idx) =>
        idx === index
          ? {
              ...slot,
              equipment: {
                ...slot.equipment,
                [slotId]: { ...slot.equipment[slotId], main: value },
              },
            }
          : slot,
      ),
      invalidSubSlots: team.invalidSubSlots.filter((slotIndex) => slotIndex !== index),
      invalidEquipSlots: team.invalidEquipSlots.filter((slotIndex) => slotIndex !== index),
    }))
  }

  const handleEquipmentSubChange = (teamIndex, index, slotId, selectedValues) => {
    const trimmed = selectedValues.slice(0, 4);
    updateTeamByIndex(teamIndex, (team) => ({
      ...team,
      equipmentBySlot: team.equipmentBySlot.map((slot, idx) =>
        idx === index
          ? {
              ...slot,
              equipment: {
                ...slot.equipment,
                [slotId]: { ...slot.equipment[slotId], subs: trimmed },
              },
            }
          : slot,
      ),
      invalidSubSlots: team.invalidSubSlots.filter((slotIndex) => slotIndex !== index),
      invalidEquipSlots: team.invalidEquipSlots.filter((slotIndex) => slotIndex !== index),
    }))
  }

  const handleEquipmentRingChange = (teamIndex, index, value) => {
    updateTeamByIndex(teamIndex, (team) => ({
      ...team,
      equipmentBySlot: team.equipmentBySlot.map((slot, idx) =>
        idx === index ? { ...slot, ring: value } : slot,
      ),
      invalidSubSlots: team.invalidSubSlots.filter((slotIndex) => slotIndex !== index),
      invalidEquipSlots: team.invalidEquipSlots.filter((slotIndex) => slotIndex !== index),
    }))
  }

  const handleEquipmentSetChange = (teamIndex, index, value) => {
    updateTeamByIndex(teamIndex, (team) => ({
      ...team,
      equipmentBySlot: team.equipmentBySlot.map((slot, idx) =>
        idx === index ? { ...slot, set: value } : slot,
      ),
      invalidSubSlots: team.invalidSubSlots.filter((slotIndex) => slotIndex !== index),
      invalidEquipSlots: team.invalidEquipSlots.filter((slotIndex) => slotIndex !== index),
    }))
  }

  const hasSavedEquipment = (slotState) => {
    if (!slotState) return false
    const hasSet = Boolean(slotState.set)
    const hasRing = Boolean(slotState.ring)
    const hasAnyMain = equipmentSlots.some((slot) => Boolean(slotState.equipment[slot.id]?.main))
    const hasAnySubs = equipmentSlots.some((slot) => (slotState.equipment[slot.id]?.subs ?? []).length > 0)
    return hasSet || hasRing || hasAnyMain || hasAnySubs
  }

  const hasAllHeroEquipmentSaved = (team) =>
    team.selectedHeroes.every((heroId, index) => {
      if (!heroId) return true
      return hasSavedEquipment(team.equipmentBySlot[index])
    })

  const hasAllHeroSlotsFilled = (team) => {
    const selectedCount = team.selectedHeroes.filter(Boolean).length
    return isGuildWarMode ? selectedCount === requiredHeroCount : team.selectedHeroes.every((heroId) => Boolean(heroId))
  }

  const getInvalidSubSlots = (team) =>
    team.selectedHeroes
      .map((heroId, index) => {
        if (!heroId) return null
        const slotState = team.equipmentBySlot[index]
        const invalid = equipmentSlots.some((slot) => {
          const subs = slotState.equipment[slot.id]?.subs ?? []
          return subs.length < 1 || subs.length > 4
        })
        return invalid ? index : null
      })
      .filter((value) => value !== null)

  const getInvalidEquipmentSlots = (team) =>
    team.selectedHeroes
      .map((heroId, index) => {
        if (!heroId) return null
        return hasSavedEquipment(team.equipmentBySlot[index]) ? null : index
      })
      .filter((value) => value !== null)

  const guideType =
    mode === 'adventure'
      ? 'ADVENTURE'
      : mode === 'arena'
        ? 'ARENA'
        : mode === 'total-war'
          ? 'TOTAL_WAR'
          : mode === 'raid'
            ? 'RAID'
            : mode === 'growth'
              ? 'GROWTH_DUNGEON'
              : mode === 'siege'
                ? 'SIEGE'
                : mode === 'guild-war'
                  ? 'GUILD_WAR'
              : 'UNKNOWN'

  const buildTeamSlots = (team) =>
    team.selectedHeroes
      .map((heroId, index) => (heroId ? { position: index + 1, heroId } : null))
      .filter(Boolean)

  const buildSkillOrders = (team) =>
    team.skillOrder.map((item, index) => ({
      order: index + 1,
      heroId: item.heroId,
      skill: item.skill,
    }))

  const buildHeroEquipments = (team) =>
    team.selectedHeroes
      .map((heroId, index) => {
        if (!heroId) return null
        const slotState = team.equipmentBySlot[index]
        const slotDetails = equipmentSlots.map((slot) => ({
          slotId: slot.id,
          main: slotState.equipment[slot.id]?.main ?? '',
          subs: slotState.equipment[slot.id]?.subs ?? [],
        }))
        return {
          heroId,
          equipmentSet: slotState.set,
          ring: slotState.ring,
          slots: slotDetails,
        }
      })
      .filter(Boolean)

  const handleSubmit = async () => {
    if (status === 'loading') return
    if (!getAccessToken()) {
      setStatus('error')
      setErrorMessage('공략덱 작성은 회원만 가능합니다. 로그인 후 다시 시도해주세요.')
      return
    }
    for (let i = 0; i < teamStates.length; i += 1) {
      const team = teamStates[i]
      const teamLabel = isMultiTeamMode ? `${i + 1}팀의 ` : ''
      if (!hasAllHeroSlotsFilled(team)) {
        setStatus('error')
        setErrorMessage(`${teamLabel}모든 슬롯에 영웅을 등록해주세요.`)
        setActiveTeamIndex(i)
        return
      }
      if (team.skillOrder.length === 0) {
        setStatus('error')
        setErrorMessage(`${teamLabel}스킬순서를 지정해주세요.`)
        setActiveTeamIndex(i)
        return
      }
      if (!hasAllHeroEquipmentSaved(team)) {
        setStatus('error')
        setErrorMessage(`${teamLabel}슬롯에 등록된 영웅을 클릭해 장비를 저장해주세요.`)
        setActiveTeamIndex(i)
        setTeamStates((prev) =>
          prev.map((entry, idx) =>
            idx === i ? { ...entry, invalidEquipSlots: getInvalidEquipmentSlots(entry) } : entry,
          ),
        )
        return
      }
      const invalidSlots = getInvalidSubSlots(team)
      if (invalidSlots.length) {
        setStatus('error')
        setErrorMessage(`${teamLabel}부옵은 최소1개 ~ 최대4개까지 설정가능합니다.`)
        setActiveTeamIndex(i)
        setTeamStates((prev) =>
          prev.map((entry, idx) =>
            idx === i ? { ...entry, invalidSubSlots: invalidSlots } : entry,
          ),
        )
        return
      }
    }
    setStatus('loading')
    setErrorMessage('')
    try {
      const buildTeamPayload = (team) => ({
        formationId: team.formationId,
        petId: team.selectedPet,
        slots: buildTeamSlots(team),
        skillOrders: buildSkillOrders(team),
        heroEquipments: buildHeroEquipments(team),
      })
      const mergedSkillOrders = teamStates.flatMap((team) => buildSkillOrders(team))
      const mergedHeroEquipments = teamStates.flatMap((team) => buildHeroEquipments(team))
      const payload = {
        guideType,
        raidId: mode === 'raid' ? raidId : undefined,
        stageId: mode === 'growth' ? stageId : undefined,
        day: mode === 'siege' ? day : undefined,
        siegeDay: mode === 'siege' ? (siegeDayEnumBySlug[day] ?? String(day ?? '').toUpperCase()) : undefined,
        team: !isMultiTeamMode && teamStates[0] ? buildTeamPayload(teamStates[0]) : undefined,
        teams: isMultiTeamMode
          ? teamStates.map((team) => buildTeamPayload(team))
          : undefined,
        skillOrders: mergedSkillOrders,
        heroEquipments: mergedHeroEquipments,
      }
      await createGuideDeck(payload)
      setStatus('success')
      navigate(backTo)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '덱 등록에 실패했습니다.'
      setErrorMessage(message)
      setStatus('error')
    }
  }


  return (
    <section className="deck-write">
      <Link to={backTo} className="hero-back">← 이전으로</Link>
      <div className="community-toolbar">
        <div className="community-title">
          <h1>{label} 덱 작성</h1>
          <p>{note}</p>
        </div>
      </div>

      <div className="deck-write-card">
        <div className="deck-write-section">
          {isMultiTeamMode ? (
            <div className="deck-team-tabs">
              {Array.from({ length: teamCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`community-tab${activeTeamIndex === index ? ' is-active' : ''}`}
                  onClick={() => setActiveTeamIndex(index)}
                >
                  {index + 1}팀
                </button>
              ))}
            </div>
          ) : null}
          <div className="deck-write-label">진형</div>
          <select
            className="deck-write-select"
            value={currentTeam?.formationId ?? formationOptions[0].id}
            onChange={(event) =>
              updateCurrentTeam((team) => ({ ...team, formationId: event.target.value }))
            }
          >
            {formationOptions.map((formation) => (
              <option key={formation.id} value={formation.id}>{formation.label}</option>
            ))}
          </select>          <div className="deck-formation-note">슬롯을 먼저 클릭하고 영웅/펫을 선택해 배치하세요. 이후 슬롯에 배치된 영웅을 클릭해 장비를 저장하세요.</div>
          <div className="deck-units deck-units--lineup deck-units--write">
            {Array.from({ length: heroSlotCount }).map((_, index) => {
              const isBack = backPositions.includes(index + 1)
              const heroId = currentTeam?.selectedHeroes[index]
              const hero = heroId ? heroById.get(heroId) : null
              const isActive = currentTeam?.activeHeroSlot === index
              const selectedCount = (currentTeam?.selectedHeroes ?? []).filter(Boolean).length
              const isDisabled = isGuildWarMode && !hero && selectedCount >= requiredHeroCount
              return (
                <DeckSlot
                  key={`slot-${index}`}
                  isBack={isBack}
                  filled={Boolean(hero)}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  isInvalid={
                    (currentTeam?.invalidSubSlots ?? []).includes(index) ||
                    (currentTeam?.invalidEquipSlots ?? []).includes(index)
                  }
                  onClick={() => handleHeroSlotClick(index)}
                >
                  {hero ? (
                    <div className="deck-unit-button">
                      <img src={hero.image} alt={hero.name} />
                      <span>{hero.name}</span>
                    </div>) : (
                    <div className="deck-slot">슬롯 {index + 1}</div>
                  )}
                </DeckSlot>
              )
            })}
            <DeckSlot
              isBack={false}
              filled={Boolean(currentTeam?.selectedPet)}
              isActive={Boolean(currentTeam?.isPetSlotActive)}
              onClick={handlePetSlotClick}
            >
              {currentTeam?.selectedPet ? (
                <div className="deck-unit deck-unit--pet">
                  {(() => {
                    const pet = petById.get(currentTeam.selectedPet)
                    return pet ? (
                      <>
                        <img src={pet.image} alt={pet.name} />
                        <span>{pet.name}</span>
                      </>
                    ) : null
                  })()}
                </div>
              ) : (
                <div className="deck-slot">펫 슬롯</div>
              )}
            </DeckSlot>
          </div>
          

          <div className="deck-write-picker">
            <div className="deck-picker-column">
              <div className="deck-write-label">영웅 선택</div>
              <div className="hero-search deck-search">
                <div className="hero-search-inner">
                  <input
                  className="hero-search-input"
                  placeholder="영웅 검색"
                  value={currentTeam?.heroQuery ?? ''}
                  onChange={(event) =>
                    updateCurrentTeam((team) => ({ ...team, heroQuery: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      if (filteredHeroes.length && currentTeam?.activeHeroSlot !== null) {
                        handleSelectHero(filteredHeroes[0].id)
                      }
                    }
                  }}
                />
                  <button className="hero-search-button" type="button">검색</button>
                </div>
                <div className={`hero-search-results${(currentTeam?.heroQuery ?? '').trim().length ? '' : ' is-empty'}`}>
                  {(currentTeam?.heroQuery ?? '').trim().length ? (
                    filteredHeroes.length ? (
                      filteredHeroes.map((hero) => (
                        <button
                          key={hero.id}
                          type="button"
                          className="hero-search-item"
                          onClick={() => handleSelectHero(hero.id)}
                        >
                          <img src={hero.image} alt={hero.name} />
                          <span>{hero.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="hero-search-empty">검색 결과가 없습니다.</div>
                    )
                  ) : null}
                </div>
              </div>
            </div>
            <div className="deck-picker-column">
              <div className="deck-write-label">펫 선택</div>
              <div className="hero-search deck-search">
                <div className="hero-search-inner">
                  <input
                  className="hero-search-input"
                  placeholder="펫 검색"
                  value={currentTeam?.petQuery ?? ''}
                  onChange={(event) =>
                    updateCurrentTeam((team) => ({ ...team, petQuery: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      if (filteredPets.length && currentTeam?.isPetSlotActive) {
                        handleSelectPet(filteredPets[0].id)
                      }
                    }
                  }}
                />
                  <button className="hero-search-button" type="button">검색</button>
                </div>
                <div className={`hero-search-results${(currentTeam?.petQuery ?? '').trim().length ? '' : ' is-empty'}`}>
                  {(currentTeam?.petQuery ?? '').trim().length ? (
                    filteredPets.length ? (
                      filteredPets.map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          className="hero-search-item"
                          onClick={() => handleSelectPet(pet.id)}
                        >
                          <img src={pet.image} alt={pet.name} />
                          <span>{pet.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="hero-search-empty">검색 결과가 없습니다.</div>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </div>        </div>        <div className="deck-write-section">
          <div className="deck-write-label">스킬순서</div>          <p className="skill-order-help">각 영웅의 스킬을 클릭해 스킬순서를 배치하세요.</p>
          <div className="skill-order-panel">
            <div className="skill-order-choices">
              {(currentTeam?.selectedHeroes ?? [])
                .map((heroId, index) => ({ heroId, index }))
                .filter(({ heroId }) => Boolean(heroId))
                .map(({ heroId, index }) => {
                  const hero = heroById.get(heroId)
                  if (!hero) return null
                  const skillButtons = [
                    { skill: 1, image: `/images/heroskill/${hero.id}/skill1.png`, label: '스킬1' },
                    ...(hero.hasSkill2
                      ? [{ skill: 2, image: `/images/heroskill/${hero.id}/skill2.png`, label: '스킬2' }]
                      : []),
                  ]
                  return (
                    <div key={`${heroId}-${index}`} className="skill-order-hero">
                      <div className="skill-order-hero-name">{hero.name}</div>
                      <div className={`skill-order-buttons${skillButtons.length === 1 ? ' is-single' : ''}`}>
                        {skillButtons.map((skillButton) => (
                          <button
                            key={`${heroId}-${skillButton.skill}`}
                            type="button"
                            className="skill-order-button"
                            onClick={() =>
                              updateCurrentTeam((team) => ({
                                ...team,
                                skillOrder: [...team.skillOrder, { heroId, skill: skillButton.skill }],
                              }))
                            }
                            title={`${hero.name} ${skillButton.label}`}
                          >
                            <img src={skillButton.image} alt={`${hero.name} ${skillButton.label}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
            <div className="skill-order-selected">
              {(currentTeam?.skillOrder?.length ?? 0) ? (
                <div className="skill-order-list">
                  {(currentTeam?.skillOrder ?? []).map((item, idx) => {
                    const hero = heroById.get(item.heroId)
                    const label = hero ? `${hero.name}${item.skill}` : `스킬${item.skill}`
                    const showSkillImage = Boolean(hero?.id && (item.skill === 1 || item.skill === 2))
                    const skillImage = showSkillImage ? `/images/heroskill/${hero.id}/skill${item.skill}.png` : ''
                    return (
                      <div key={`${item.heroId}-${item.skill}-${idx}`} className="skill-order-item">
                        <button
                          type="button"
                          className="skill-order-chip"
                          onClick={() =>
                            updateCurrentTeam((team) => ({
                              ...team,
                              skillOrder: team.skillOrder.filter((_, i) => i !== idx),
                            }))
                          }
                          title="클릭해서 제거"
                        >
                          {skillImage ? (
                            <img src={skillImage} alt={label} />
                          ) : (
                            <span>{label}</span>
                          )}
                        </button>
                        {idx < (currentTeam?.skillOrder?.length ?? 0) - 1 ? (
                          <span className="skill-order-arrow">→</span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="skill-order-empty">선택한 스킬이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {status === 'error' ? (
          <div className="community-form-error" role="alert">
            {errorMessage}
          </div>
        ) : null}
        <div className="deck-write-actions">
          <button
            className="community-submit"
            type="button"
            onClick={handleSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '등록 중...' : '등록'}
          </button>
          <Link className="community-cancel" to={backTo}>취소</Link>
        </div>
      </div>
      {equipmentModalState !== null && activeHero ? (
        <div className="equipment-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="equipment-modal-backdrop"
            onClick={handleCloseEquipmentModal}
            aria-label="닫기"
          />
          <div className="equipment-modal-card" role="document">
            <div className="equipment-modal-header">
              <div>
                <h2>{activeHero.name}</h2>
                <p>장비 정보</p>
              </div>
              <div className="equipment-modal-controls">
                <label className="deck-equipment-field">
                  <span>장비 세트</span>
                  <select
                    className="deck-write-select"
                    value={activeEquipmentSlot?.set ?? ''}
                    onChange={(event) =>
                      handleEquipmentSetChange(
                        equipmentModalState.teamIndex,
                        equipmentModalState.slotIndex,
                        event.target.value,
                      )
                    }
                  >
                    <option value="">선택</option>
                    {equipmentSetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="deck-equipment-field">
                  <span>반지</span>
                  <select
                    className="deck-write-select"
                    value={activeEquipmentSlot?.ring ?? ''}
                    onChange={(event) =>
                      handleEquipmentRingChange(
                        equipmentModalState.teamIndex,
                        equipmentModalState.slotIndex,
                        event.target.value,
                      )
                    }
                  >
                    <option value="">선택</option>
                    {ringOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="deck-equipment-grid">
              {equipmentSlots.map((slot) => {
                const slotState = activeEquipmentSlot?.equipment?.[slot.id] ?? { main: '', subs: [] }
                const options =
                  slot.id === 'armor1' || slot.id === 'armor2'
                    ? armorMainOptions
                    : weaponMainOptions
                return (
                  <div key={slot.id} className="deck-equipment-card">
                    <div className="deck-equipment-title">{slot.label}</div>
                    <label className="deck-equipment-field">
                      <span>주옵</span>
                      <select
                        className="deck-write-select"
                        value={slotState.main}
                        onChange={(event) =>
                          handleEquipmentMainChange(
                            equipmentModalState.teamIndex,
                            equipmentModalState.slotIndex,
                            slot.id,
                            event.target.value,
                          )
                        }
                      >
                        <option value="">선택</option>
                        {options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <div className="deck-equipment-field">
                      <span>부옵 (최대 4개)</span>
                      <div className="deck-suboptions">
                        {subOptions.map((option) => {
                          const selected = slotState.subs.includes(option)
                          const disableUnchecked = !selected && slotState.subs.length >= 4
                          return (
                            <label key={option} className="deck-suboption">
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={disableUnchecked}
                                onChange={(event) => {
                                  const current = slotState.subs
                                  const next = event.target.checked
                                    ? [...current, option]
                                    : current.filter((value) => value !== option)
                                  handleEquipmentSubChange(
                                    equipmentModalState.teamIndex,
                                    equipmentModalState.slotIndex,
                                    slot.id,
                                    next,
                                  )
                                }}
                              />
                              <span>{option}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="community-modal-actions">
              <button className="community-modal-submit" type="button" onClick={handleCloseEquipmentModal}>
                저장
              </button>
              <button
                className="community-modal-cancel"
                type="button"
                onClick={() =>
                  handleRemoveHero(equipmentModalState.teamIndex, equipmentModalState.slotIndex)
                }
              >
                슬롯 비우기
              </button>
              <button className="community-modal-cancel" type="button" onClick={handleCloseEquipmentModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}    </section>
  )
}

export default GuidesDeckWrite


















