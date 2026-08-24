import { clearSession, currentUser, setSession } from '@/lib/auth'
import { publicUser } from '@/lib/map'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser()
  const demoUsers = await prisma.user.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({
    user: user ? publicUser(user) : null,
    demoUsers: demoUsers.map(publicUser),
  })
}

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string }
  if (!body.userId) return NextResponse.json({ error: 'user' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: body.userId } })
  if (!user) return NextResponse.json({ error: 'missing' }, { status: 404 })
  await setSession(user.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
