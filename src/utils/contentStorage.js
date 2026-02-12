import {
  createHero,
  createPet,
  fetchHero,
  fetchHeroes,
  fetchPet,
  fetchPets,
  uploadAdminFile,
} from '../api/endpoints/contentAdmin'

const CONTENT_CHANGE_EVENT = 'sena-content-change'
const CDN_BASE_URL = String(import.meta.env.VITE_CDN_BASE_URL ?? '').replace(/\/+$/, '')

const HERO_TYPE_OPTIONS = [
  { key: 'attack', label: '공격형', icon: '/images/types/attack.png' },
  { key: 'magic', label: '마법형', icon: '/images/types/magic.png' },
  { key: 'defense', label: '방어형', icon: '/images/types/defense.png' },
  { key: 'support', label: '지원형', icon: '/images/types/support.png' },
  { key: 'allround', label: '만능형', icon: '/images/types/allround.png' },
]

const HERO_GRADE_OPTIONS = [
  { key: 'rare', label: '희귀' },
  { key: 'legend', label: '전설' },
  { key: 'special', label: '스페셜' },
  { key: 'sena', label: '구세나' },
]

const PET_GRADE_OPTIONS = [
  { key: 'legend', label: '전설' },
  { key: 'rare', label: '희귀' },
]

const mapByKey = (items) =>
  items.reduce((acc, item) => {
    acc[item.key] = item
    return acc
  }, {})

const typeMap = mapByKey(HERO_TYPE_OPTIONS)
const heroGradeMap = mapByKey(HERO_GRADE_OPTIONS)
const petGradeMap = mapByKey(PET_GRADE_OPTIONS)

const normalizeList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const toAssetUrl = (source) => {
  if (!source) return ''
  const value = String(source).trim()
  if (!value) return ''
  if (value.startsWith('data:')) return value
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/images/') || value.startsWith('images/')) {
    return value.startsWith('/') ? value : `/${value}`
  }
  if (value.startsWith('/')) {
    return CDN_BASE_URL ? `${CDN_BASE_URL}${value}` : value
  }
  return CDN_BASE_URL ? `${CDN_BASE_URL}/${value}` : `/${value}`
}

const normalizeHero = (hero) => {
  const typeMeta = typeMap[hero?.type] ?? null
  const gradeMeta = heroGradeMap[hero?.grade] ?? null
  const imageKey = hero?.imageKey ?? hero?.image_key ?? ''
  const basicSkillImageKey = hero?.basicSkillImageKey ?? hero?.basic_skill_image_key ?? ''
  const skill1ImageKey = hero?.skill1ImageKey ?? hero?.skill1_image_key ?? ''
  const skill2ImageKey = hero?.skill2ImageKey ?? hero?.skill2_image_key ?? ''
  const passiveSkillImageKey = hero?.passiveSkillImageKey ?? hero?.passive_skill_image_key ?? ''

  return {
    ...hero,
    imageKey,
    basicSkillImageKey,
    skill1ImageKey,
    skill2ImageKey,
    passiveSkillImageKey,
    image: toAssetUrl(imageKey || hero?.image),
    basicSkillImage: toAssetUrl(basicSkillImageKey || hero?.basicSkillImage),
    skill1Image: toAssetUrl(skill1ImageKey || hero?.skill1Image),
    skill2Image: toAssetUrl(skill2ImageKey || hero?.skill2Image),
    passiveSkillImage: toAssetUrl(passiveSkillImageKey || hero?.passiveSkillImage),
    nickname: hero?.nickname ?? '',
    usage: normalizeList(hero?.usage),
    gear: normalizeList(hero?.gear),
    acquisition: normalizeList(hero?.acquisition),
    typeLabel: typeMeta?.label ?? hero?.typeLabel ?? '미분류',
    typeIcon: hero?.typeIcon ?? typeMeta?.icon ?? '',
    gradeLabel: gradeMeta?.label ?? hero?.gradeLabel ?? '미분류',
    hasSkill2: hero?.hasSkill2 ?? true,
  }
}

const normalizePet = (pet) => {
  const gradeMeta = petGradeMap[pet?.grade] ?? null
  const imageKey = pet?.imageKey ?? pet?.image_key ?? ''
  const skillImageKey = pet?.skillImageKey ?? pet?.skill_image_key ?? ''
  const imageSource = imageKey || pet?.image || (pet?.id ? `/images/pets/${pet.id}.png` : '')
  return {
    ...pet,
    imageKey,
    skillImageKey,
    image: toAssetUrl(imageSource),
    skillImage: toAssetUrl(skillImageKey || pet?.skillImage),
    nickname: pet?.nickname ?? '',
    acquisition: normalizeList(pet?.acquisition),
    gradeLabel: gradeMeta?.label ?? pet?.gradeLabel ?? '미분류',
    skill: pet?.skill ?? null,
  }
}

const sortHeroes = (items) => {
  const gradeOrder = { sena: 0, special: 1, legend: 2, rare: 3, unknown: 99 }
  return [...items].sort((a, b) => {
    const byGrade = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99)
    if (byGrade !== 0) return byGrade
    return a.name.localeCompare(b.name, 'ko')
  })
}

const sortPets = (items) => {
  const gradeOrder = { legend: 0, rare: 1, unknown: 99 }
  return [...items].sort((a, b) => {
    const byGrade = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99)
    if (byGrade !== 0) return byGrade
    return a.name.localeCompare(b.name, 'ko')
  })
}

const getUploadKey = (uploadResult) =>
  uploadResult?.imageKey ?? uploadResult?.key ?? ''

export const getAllHeroes = async () => {
  const result = await fetchHeroes()
  const items = Array.isArray(result) ? result : result?.content ?? result?.items ?? []
  return sortHeroes(items.map(normalizeHero))
}

export const getAllPets = async () => {
  const result = await fetchPets()
  const items = Array.isArray(result) ? result : result?.content ?? result?.items ?? []
  return sortPets(items.map(normalizePet))
}

export const getHeroById = async (id) => {
  return normalizeHero(await fetchHero(id))
}

export const getPetById = async (id) => {
  return normalizePet(await fetchPet(id))
}

export const addCustomHero = async (payload) => {
  const result = await createHero(payload)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONTENT_CHANGE_EVENT))
  }
  return normalizeHero(result ?? payload)
}

export const addCustomPet = async (payload) => {
  const result = await createPet(payload)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONTENT_CHANGE_EVENT))
  }
  return normalizePet(result ?? payload)
}

export const uploadImage = async (file, type) => {
  if (!file) return ''
  const uploadResult = await uploadAdminFile(file, type)
  return getUploadKey(uploadResult)
}

export const slugifyId = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

export const contentChangeEvent = CONTENT_CHANGE_EVENT
export const heroTypeOptions = HERO_TYPE_OPTIONS
export const heroGradeOptions = HERO_GRADE_OPTIONS
export const petGradeOptions = PET_GRADE_OPTIONS
