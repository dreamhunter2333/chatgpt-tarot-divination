// the api reports limits as "60req/3600seconds"
export function formatRateLimit(rateLimit?: string) {
  const match = rateLimit?.match(/^(\d+)req\/(\d+)seconds$/)
  if (!match) return rateLimit
  const [, count, seconds] = match.map(Number)
  const [size, unit] = seconds % 3600 === 0 ? [seconds / 3600, '小时'] : seconds % 60 === 0 ? [seconds / 60, '分钟'] : [seconds, '秒']
  return `每${size === 1 ? '' : ` ${size} `}${unit} ${count} 次`
}
