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
