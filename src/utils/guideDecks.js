export const formationOptions = [
  { id: 'basic', label: '기본진형' },
  { id: 'balance', label: '밸런스진형' },
  { id: 'attack', label: '공격진형' },
  { id: 'protect', label: '보호진형' },
]

export const formationBackPositions = {
  basic: [1, 3, 5],
  balance: [2, 4],
  attack: [1, 2, 4, 5],
  protect: [3],
}

export const formationLabelById = formationOptions.reduce((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

export const formatGuideDeckDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export const equipmentSlots = [
  { id: 'weapon1', label: '무기 1' },
  { id: 'armor1', label: '방어구 1' },
  { id: 'weapon2', label: '무기 2' },
  { id: 'armor2', label: '방어구 2' },
]

const coerceArray = (value) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const normalizeHeroKey = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.id || value.heroId || value.heroName || value.name || null
}

const normalizeRaidKey = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const normalized = raw
    .replace(/[\s-]+/g, '_')
    .replace(/[^\p{L}\p{N}_]/gu, '')
    .toUpperCase()
  return normalized || null
}

const pickRaidName = (raw) => {
  if (!raw) return ''
  const candidate =
    raw.raidName ??
    raw.bossName ??
    raw.targetName ??
    raw.raidLabel ??
    raw.raid?.name ??
    raw.raidInfo?.name ??
    ''
  return typeof candidate === 'string' ? candidate.trim() : ''
}

const normalizeSiegeDay = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const upper = raw.toUpperCase()
  const map = {
    MON: 'MON',
    MONDAY: 'MON',
    TUE: 'TUE',
    TUESDAY: 'TUE',
    WED: 'WED',
    WEDNESDAY: 'WED',
    THU: 'THU',
    THURSDAY: 'THU',
    FRI: 'FRI',
    FRIDAY: 'FRI',
    SAT: 'SAT',
    SATURDAY: 'SAT',
    SUN: 'SUN',
    SUNDAY: 'SUN',
  }
  if (map[upper]) return map[upper]
  const slugMap = {
    MON: 'MON',
    TUE: 'TUE',
    WED: 'WED',
    THU: 'THU',
    FRI: 'FRI',
    SAT: 'SAT',
    SUN: 'SUN',
  }
  const slug = upper.slice(0, 3)
  return slugMap[slug] ?? null
}

const normalizeSlotKey = (value) => {
  if (!value) return null
  const key = String(value).toLowerCase()
  if (key.includes('weapon1') || key.includes('weapon_1')) return 'weapon1'
  if (key.includes('armor1') || key.includes('armor_1')) return 'armor1'
  if (key.includes('weapon2') || key.includes('weapon_2')) return 'weapon2'
  if (key.includes('armor2') || key.includes('armor_2')) return 'armor2'
  return value
}

const normalizeSkillValue = (value) => {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (Number.isFinite(parsed)) return parsed
  return null
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toTimestamp = (value) => {
  if (!value) return 0
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const date = new Date(value)
  const time = date.getTime()
  return Number.isFinite(time) ? time : 0
}

const getHeroSkillImage = (hero, skill) => {
  if (!hero || (skill !== 1 && skill !== 2)) return ''
  const image = skill === 1 ? hero.skill1Image : hero.skill2Image
  if (image) return image
  if (!hero.id) return ''
  return `/images/heroskill/${hero.id}/skill${skill}.png`
}

export const normalizeSkillOrder = (skillOrderRaw, heroById, heroByName) => {
  if (!skillOrderRaw) return { text: '', items: [] }

  const buildItem = ({ hero, heroName, skill, label }) => {
    const normalizedSkill = normalizeSkillValue(skill)
    const canShowImage = Boolean(hero?.id && (normalizedSkill === 1 || normalizedSkill === 2))
    const resolvedLabel = label || `${heroName ?? ''}${normalizedSkill ?? ''}`.trim()
    if (!resolvedLabel) return null
    return {
      heroId: hero?.id ?? null,
      heroName: hero?.name ?? heroName ?? '',
      skill: normalizedSkill,
      label: resolvedLabel,
      image: canShowImage ? getHeroSkillImage(hero, normalizedSkill) : '',
    }
  }

  if (typeof skillOrderRaw === 'string') {
    const tokens = skillOrderRaw
      .split('-')
      .map((token) => token.trim())
      .filter(Boolean)
    const items = tokens
      .map((token) => {
        const matched = token.match(/^(.*?)(\d+)$/)
        if (!matched) return buildItem({ hero: null, heroName: '', skill: null, label: token })
        const heroName = matched[1]?.trim() ?? ''
        const skill = normalizeSkillValue(matched[2])
        const hero = heroByName.get(heroName)
        return buildItem({ hero, heroName, skill, label: token })
      })
      .filter(Boolean)
    return {
      text: skillOrderRaw,
      items,
    }
  }

  if (!Array.isArray(skillOrderRaw)) return { text: '', items: [] }

  const items = skillOrderRaw
    .map((item) => {
      if (!item) return null
      const heroKey = normalizeHeroKey(item.heroId ?? item.hero ?? item.heroName ?? item)
      const hero = heroById.get(heroKey) || heroByName.get(heroKey)
      const skill = normalizeSkillValue(
        item.skill ?? item.skillNo ?? item.skillNumber ?? item.orderSkill ?? item.skillId,
      )
      const heroName = hero?.name ?? (typeof heroKey === 'string' ? heroKey : '')
      return buildItem({
        hero,
        heroName,
        skill,
        label: heroName && skill ? `${heroName}${skill}` : '',
      })
    })
    .filter(Boolean)

  return {
    text: items.map((item) => item.label).join('-'),
    items,
  }
}

export const normalizeGuideDeckList = (data, heroById, heroByName) => {
  const list = Array.isArray(data) ? data : data?.items ?? data?.content ?? data?.data ?? []
  return list
    .map((item) => normalizeGuideDeckSummary(item, heroById, heroByName))
    .filter(Boolean)
}

export const normalizeGuideDeckSummary = (raw, heroById, heroByName) => {
  if (!raw) return null
  const normalizeTeam = (teamRaw, fallbackRaw = null) => {
    const heroesRaw =
      teamRaw?.heroes ??
      teamRaw?.heroIds ??
      teamRaw?.heroList ??
      fallbackRaw?.heroes ??
      fallbackRaw?.heroIds ??
      []

    let heroes = []
    if (Array.isArray(heroesRaw) && heroesRaw.length) {
      heroes = heroesRaw.map(normalizeHeroKey).filter(Boolean)
    } else {
      const slots = teamRaw?.slots ?? fallbackRaw?.slots ?? []
      const sortedSlots = [...slots].sort((a, b) => {
        const aPos = a.position ?? a.slotIndex ?? a.order ?? a.slot ?? 0
        const bPos = b.position ?? b.slotIndex ?? b.order ?? b.slot ?? 0
        return aPos - bPos
      })
      const maxPosition = sortedSlots.reduce((max, slot) => {
        const position = Number(slot.position ?? slot.slotIndex ?? slot.order ?? slot.slot ?? 0)
        return Number.isFinite(position) ? Math.max(max, position) : max
      }, 0)
      heroes = maxPosition > 0 ? Array.from({ length: maxPosition }, () => null) : []
      sortedSlots.forEach((slot) => {
        const position = Number(slot.position ?? slot.slotIndex ?? slot.order ?? slot.slot ?? 0)
        const heroKey = normalizeHeroKey(slot.heroId ?? slot.hero ?? slot)
        if (!Number.isFinite(position) || position < 1) return
        if (position - 1 >= heroes.length) return
        heroes[position - 1] = heroKey
      })
    }

    const pet =
      teamRaw?.pet ??
      teamRaw?.petId ??
      fallbackRaw?.pet ??
      fallbackRaw?.petId ??
      fallbackRaw?.petName ??
      null

    const formationId =
      teamRaw?.formationId ??
      teamRaw?.formation ??
      fallbackRaw?.formationId ??
      fallbackRaw?.formation ??
      fallbackRaw?.formationType ??
      fallbackRaw?.formation?.id ??
      null

    const skillOrderRaw =
      teamRaw?.skillOrders ??
      teamRaw?.skillOrder ??
      teamRaw?.skillSequence ??
      teamRaw?.skillList ??
      fallbackRaw?.skillOrder ??
      fallbackRaw?.skillOrders ??
      fallbackRaw?.skillSequence ??
      fallbackRaw?.skillList

    const skillOrderData = normalizeSkillOrder(skillOrderRaw, heroById, heroByName)

    return {
      heroes,
      pet,
      formationId,
      formationLabel: teamRaw?.formation?.label ?? formationLabelById[formationId] ?? '',
      skillOrder: skillOrderData.text,
      skillOrderItems: skillOrderData.items,
    }
  }

  const rawTeams = Array.isArray(raw.teams) && raw.teams.length
    ? raw.teams
    : [raw.team ?? raw.lineup ?? {}]
  const teams = rawTeams
    .map((teamRaw, index) => normalizeTeam(teamRaw, index === 0 ? raw : null))
    .filter((team) => team.heroes.length || team.pet || team.formationId || team.skillOrder || team.skillOrderItems.length)
  const primaryTeam = teams[0] ?? normalizeTeam(raw.team ?? raw.lineup ?? {}, raw)

  const authorCandidate =
    raw.authorNickname ??
    raw.author ??
    raw.writer ??
    raw.writerName ??
    raw.nickname ??
    raw.userName ??
    raw.createdBy
  const author =
    typeof authorCandidate === 'string'
      ? authorCandidate
      : authorCandidate?.nickname ?? authorCandidate?.name ?? ''

  const createdAt =
    raw.createdAt ??
    raw.createdDate ??
    raw.createdTime ??
    raw.created_at ??
    raw.createAt ??
    raw.regDate ??
    raw.registeredAt ??
    raw.deck?.createdAt ??
    raw.deck?.createdDate
  const likes = toNumber(raw.likes ?? raw.likeCount ?? raw.recommendCount ?? raw.upVotes ?? raw.upCount, 0)
  const dislikes = toNumber(raw.dislikes ?? raw.dislikeCount ?? raw.unrecommendCount ?? raw.downVotes ?? raw.downCount, 0)

  return {
    id:
      raw.id ??
      raw.deckId ??
      raw.deck_id ??
      raw.guideDeckId ??
      raw.guide_deck_id ??
      raw.deck?.id,
    author,
    createdAt,
    createdAtTs: toTimestamp(createdAt),
    likes,
    dislikes,
    raidId: normalizeRaidKey(
      raw.raidId ??
      raw.raid ??
      raw.raidType ??
      raw.raidCode ??
      raw.bossId ??
      raw.bossType ??
      raw.targetId ??
      raw.targetType ??
      raw.raidInfo?.id ??
      raw.raidInfo?.code ??
      raw.raidInfo?.type ??
      raw.raid?.id ??
      raw.raid?.code ??
      raw.raid?.type,
    ),
    raidName: pickRaidName(raw),
    siegeDay: normalizeSiegeDay(
      raw.siegeDay ??
      raw.day ??
      raw.dayOfWeek ??
      raw.weekDay ??
      raw.weekday ??
      raw.siege?.day ??
      raw.siege?.siegeDay ??
      raw.siegeInfo?.day ??
      raw.siegeInfo?.siegeDay,
    ),
    heroes: primaryTeam.heroes,
    pet: primaryTeam.pet,
    formationId: primaryTeam.formationId,
    formationLabel: primaryTeam.formationLabel,
    skillOrder: primaryTeam.skillOrder,
    skillOrderItems: primaryTeam.skillOrderItems,
    teams,
  }
}

export const formatSkillOrder = (skillOrderRaw, heroById, heroByName) => {
  return normalizeSkillOrder(skillOrderRaw, heroById, heroByName).text
}

export const normalizeEquipmentResponse = (raw) => {
  const payload = raw?.equipment ?? raw?.data ?? raw ?? {}
  const setName =
    payload.set ??
    payload.equipmentSet ??
    payload.setName ??
    payload.equipmentSetName ??
    payload.equipment?.set ??
    payload.equipment?.setName ??
    ''

  const ring =
    payload.ring ??
    payload.ringName ??
    payload.ringId ??
    payload.equipment?.ring ??
    ''

  const slotMap = {}
  const equipObject = payload.equipment ?? payload.slots ?? payload

  if (Array.isArray(payload.slots)) {
    payload.slots.forEach((slot) => {
      const slotKey = normalizeSlotKey(slot.slotId ?? slot.slot ?? slot.type ?? slot.name)
      if (!slotKey) return
      slotMap[slotKey] = {
        main: slot.main ?? slot.mainOption ?? slot.mainStat ?? '',
        subs: coerceArray(slot.subs ?? slot.subOptions ?? slot.subStats),
      }
    })
  } else if (equipObject && typeof equipObject === 'object') {
    equipmentSlots.forEach((slot) => {
      const value = equipObject[slot.id]
      if (!value) return
      slotMap[slot.id] = {
        main: value.main ?? value.mainOption ?? value.mainStat ?? '',
        subs: coerceArray(value.subs ?? value.subOptions ?? value.subStats),
      }
    })
  }

  equipmentSlots.forEach((slot) => {
    if (slotMap[slot.id]) return
    const mainKey = `${slot.id}Main`
    const subsKey = `${slot.id}Subs`
    const main =
      payload[mainKey] ??
      payload[`${slot.id}MainOption`] ??
      payload[`${slot.id}MainStat`]
    const subs =
      payload[subsKey] ??
      payload[`${slot.id}SubOptions`] ??
      payload[`${slot.id}SubStats`]
    if (main || subs) {
      slotMap[slot.id] = {
        main: main ?? '',
        subs: coerceArray(subs),
      }
    }
  })

  return {
    setName,
    ring,
    slots: slotMap,
  }
}
