export function followingAuthorIds(userId: string, followingIds: string[]) {
  return Array.from(new Set([userId, ...followingIds]))
}

export function toggleMember(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

export function threadKey(a: string, b: string) {
  return [a, b].sort().join(':')
}

export function canFollow(followerId: string, targetId: string) {
  return followerId !== targetId
}

export function unreadCount(items: { read: boolean }[]) {
  return items.filter((item) => !item.read).length
}

export function clipBody(body: string, max = 280) {
  const text = body.trim()
  if (!text) return ''
  return text.slice(0, max)
}

export function remainingChars(body: string, max = 280) {
  return max - body.length
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function matchesQuery(haystack: string, q: string) {
  const needle = fold(q.trim())
  if (!needle) return true
  return fold(haystack).includes(needle)
}

export function timeAgo(iso: string, now = Date.now(), locale: 'pt' | 'en' = 'pt') {
  const minutes = Math.floor(Math.max(0, now - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return locale === 'pt' ? 'agora' : 'now'
  if (minutes < 60) return locale === 'pt' ? `há ${minutes} min` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale === 'pt' ? `há ${hours} h` : `${hours}h`
  const days = Math.floor(hours / 24)
  return locale === 'pt' ? `há ${days} d` : `${days}d`
}
