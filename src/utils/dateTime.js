const ISO_WITHOUT_TIMEZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T/
const HAS_TIMEZONE_SUFFIX_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i

export const parseApiDateTime = (value) => {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const raw = String(value).trim()
  if (!raw) return null

  const normalized =
    ISO_WITHOUT_TIMEZONE_PATTERN.test(raw) && !HAS_TIMEZONE_SUFFIX_PATTERN.test(raw)
      ? `${raw}Z`
      : raw

  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDateTimeSeoul = (value) => {
  const date = parseApiDateTime(value)
  if (!date) return value ? String(value) : '-'

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  })
}
