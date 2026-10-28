// the api reports limits as "60req/3600seconds"
function parseRateLimit(rateLimit?: string) {
  const match = rateLimit?.match(/^(\d+)req\/(\d+)seconds$/)
  if (!match) return null
  const [, count, seconds] = match.map(Number)
  return { count, seconds }
}

export function formatRateLimit(rateLimit?: string) {
  const parsed = parseRateLimit(rateLimit)
  if (!parsed) return rateLimit
  const { count, seconds } = parsed
  const [size, unit] = seconds % 3600 === 0 ? [seconds / 3600, '小时'] : seconds % 60 === 0 ? [seconds / 60, '分钟'] : [seconds, '秒']
  return `每${size === 1 ? '' : ` ${size} `}${unit} ${count} 次`
}

export function isHigherRateLimit(rateLimit?: string, than?: string) {
  const a = parseRateLimit(rateLimit)
  const b = parseRateLimit(than)
  return !!a && !!b && a.count / a.seconds > b.count / b.seconds
}
