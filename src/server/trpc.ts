import { currentUser } from '@/lib/auth'
import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

export async function createContext() {
  const user = await currentUser()
  return { user }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { user: ctx.user } })
})
