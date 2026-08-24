import { prisma } from './prisma'
import { publishUser } from './realtime'

export async function notify(userId: string, actorId: string, kind: string, postId?: string) {
  if (userId === actorId) return
  await prisma.notification.create({
    data: { userId, actorId, kind, postId },
  })
  await publishUser(userId, { type: kind, postId })
}
