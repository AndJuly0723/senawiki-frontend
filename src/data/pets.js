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
    grade: grade?.key ?? 'unknown',
    gradeLabel: grade?.label ?? '미분류',
  }
})
