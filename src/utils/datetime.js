export function toDate(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, locale = undefined, options = undefined) {
  const date = toDate(value)
  if (!date) {
    return ''
  }

  const formatOptions = options || {
    dateStyle: 'medium',
    timeStyle: 'short'
  }

  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(date)
  } catch (error) {
    return ''
  }
}

export function formatDuration(start, end = new Date()) {
  const startDate = toDate(start)
  const endDate = toDate(end)

  if (!startDate || !endDate) {
    return ''
  }

  let diff = Math.max(0, endDate.getTime() - startDate.getTime())

  const msInSecond = 1000
  const msInMinute = msInSecond * 60
  const msInHour = msInMinute * 60
  const msInDay = msInHour * 24

  const days = Math.floor(diff / msInDay)
  diff -= days * msInDay

  const hours = Math.floor(diff / msInHour)
  diff -= hours * msInHour

  const minutes = Math.floor(diff / msInMinute)
  diff -= minutes * msInMinute

  const seconds = Math.floor(diff / msInSecond)

  const parts = []

  if (days) {
    parts.push(`${days}d`)
  }

  if (days || hours) {
    parts.push(`${hours}h`)
  }

  if (days || hours || minutes) {
    parts.push(`${minutes}m`)
  }

  if (!parts.length) {
    parts.push(`${seconds}s`)
  }

  return parts.join(' ')
}

export function isSameDay(a, b) {
  const dateA = toDate(a)
  const dateB = toDate(b)

  if (!dateA || !dateB) {
    return false
  }

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}
