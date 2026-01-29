const petNameMap = {
  dello: '델로',
  doo: '두',
  durgi: '더지',
  eri: '에리',
  helepin: '헬레핀',
  irin: '이린',
  karam: '카람',
  kri: '크리',
  kroa: '크로아',
  melpe: '멜패로',
  mick: '믹',
  mimic: '미믹',
  mumu: '뮤뮤',
  nikki: '니키',
  nina: '니나',
  note: '노트',
  paragon: '파라곤',
  pike: '파이크',
  poong: '풍소협',
  richel: '리첼',
  roo: '루',
  seri: '세리',
  windy: '윈디',
  yeonji: '연지',
  yu: '유',
}

const petNicknameById = {
  roo: '축복의 천사',
  irin: '사냥터의 왕',
  richel: '고귀한 귀족',
  kri: '복수의 악마',
  pike: '따뜻한 눈보라',
  dello: '작은 사신',
  windy: '대마법사의 조력',
  yu: '총운의 정령',
  yeonji: '잠을 인도하는',
  karam: '푸른 화령',
  melpe: '혼돈의 흑조',
  mick: '황금 상자',
  durgi: '영리한 탐험가',
  eri: '행복을 전하는',
  mimic: '반짝이는 상자',
  doo: '행운의 탐험가',
  nina: '감동의 정화',
  poong: '호위 무사',
  mumu: '천둥 신선',
  helepin: '발키리의 그리폰',
  kroa: '심연의 상징',
  paragon: '하늘의 눈',
  note: '대도서관',
  nikki: '완전체 쥐',
  seri: '세인의 친구',
}

const petGradeByName = {
  전설: [
    '델로',
    '더지',
    '에리',
    '이린',
    '카람',
    '크리',
    '멜패로',
    '믹',
    '파이크',
    '리첼',
    '루',
    '윈디',
    '연지',
    '유',
  ],
  희귀: [
    '두',
    '헬레핀',
    '크로아',
    '미믹',
    '뮤뮤',
    '니키',
    '니나',
    '노트',
    '파라곤',
    '풍소협',
    '세리',
  ],
}

const petSkillById = {
  roo: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '방어력 22% 증가',
  },
  irin: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '물리공격력 21% 증가',
  },
  richel: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['약점 공격 확률 17% 증가', '약점 공격 피해량 10% 증가'],
  },
  kri: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['효과 적중 19% 증가', '모든 공격력 12% 증가'],
  },
  pike: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['효과 저항 19% 증가', '방어력 13% 증가'],
  },
  dello: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['치명타 확률 21% 증가', '치명타 피해 15% 증가'],
  },
  windy: {
    name: '펫의 응원',
    targets: ['모든 적군', '모든 아군'],
    descriptionLines: ['보스가 받는 피해량 26% 증가', '모든 공격력 12% 증가'],
  },
  yu: {
    name: '펫의 응원',
    target: '모든 적군',
    descriptionLines: ['방어력 10% 감소', '받는 회복량 32% 감소'],
  },
  yeonji: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '마법 공격력 21% 증가',
  },
  karam: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['받는 피해량 8% 감소', '막기 확률 15% 증가'],
  },
  melpe: {
    name: '펫의 응원',
    target: '모든 아군',
    descriptionLines: ['효과 적용 확률 10% 증가', '효과 적중 19% 증가'],
  },
  mick: {
    name: '펫의 응원',
    description: '모험에서 골드 20% 추가 획득',
  },
  durgi: {
    name: '펫의 응원',
    description: '모험에서 장비 및 장신구 획득 확률 30% 증가',
  },
  eri: {
    name: '펫의 응원',
    description: '모험에서 영웅 획득 확률 10% 증가',
  },
  mimic: {
    name: '펫의 응원',
    description: '모험에서 골드 10% 추가 획득',
  },
  doo: {
    name: '펫의 응원',
    description: '모험에서 장비 및 장신구 획득 확률 10% 증가',
  },
  nina: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '치명타 확률 17% 증가',
  },
  poong: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '치명타 피해 25% 증가',
  },
  mumu: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '주는 피해량 10% 증가',
  },
  helepin: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '막기확률 17% 증가',
  },
  kroa: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '모든 공격력 12% 증가',
  },
  paragon: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '방어력 17% 증가',
  },
  note: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '마법 공격력 17% 증가',
  },
  nikki: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '효과 적중 25% 증가',
  },
  seri: {
    name: '펫의 응원',
    target: '모든 아군',
    description: '물리 공격력 17% 증가',
  },
}

const gradeMeta = {
  전설: { key: 'legend', label: '전설' },
  희귀: { key: 'rare', label: '희귀' },
}

const nameToGrade = Object.entries(petGradeByName).reduce((acc, [grade, names]) => {
  names.forEach((name) => {
    acc[name] = grade
  })
  return acc
}, {})

export const pets = Object.keys(petNameMap).map((id) => {
  const name = petNameMap[id]
  const gradeLabel = nameToGrade[name]
  const grade = gradeLabel ? gradeMeta[gradeLabel] : null

  return {
    id,
    name,
    image: `/images/pets/${id}.png`,
    nickname: petNicknameById[id],
    grade: grade?.key ?? 'unknown',
    gradeLabel: grade?.label ?? '미분류',
    skill: petSkillById[id],
  }
})
