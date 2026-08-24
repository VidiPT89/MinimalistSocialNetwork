import { mapPost, postInclude, publicUser } from '@/lib/map'
import { notify } from '@/lib/notify'
import { prisma } from '@/lib/prisma'
import { publishUser } from '@/lib/realtime'
import { canFollow, clipBody, followingAuthorIds, threadKey } from '@/lib/social'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const appRouter = router({
  post: router({
    feed: publicProcedure
      .input(z.object({ scope: z.enum(['following', 'all']).default('following') }))
      .query(async ({ ctx, input }) => {
        const viewer = ctx.user
        let authorIds: string[] | undefined
        if (input.scope === 'following') {
          if (!viewer) return []
          const follows = await prisma.follow.findMany({
            where: { followerId: viewer.id },
            select: { followingId: true },
          })
          authorIds = followingAuthorIds(
            viewer.id,
            follows.map((item) => item.followingId),
          )
        }
        const posts = await prisma.post.findMany({
          where: authorIds ? { authorId: { in: authorIds } } : undefined,
          include: postInclude,
          orderBy: { createdAt: 'desc' },
          take: 40,
        })
        return posts.map((post) => mapPost(post, viewer?.id))
      }),

    byHandle: publicProcedure.input(z.object({ handle: z.string() })).query(async ({ ctx, input }) => {
      const profile = await prisma.user.findUnique({ where: { handle: input.handle } })
      if (!profile) throw new TRPCError({ code: 'NOT_FOUND' })
      const followsYou = ctx.user
        ? Boolean(
            await prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: ctx.user.id, followingId: profile.id } },
            }),
          )
        : false
      const posts = await prisma.post.findMany({
        where: { authorId: profile.id },
        include: postInclude,
        orderBy: { createdAt: 'desc' },
      })
      return {
        profile: publicUser(profile),
        following: followsYou,
        posts: posts.map((post) => mapPost(post, ctx.user?.id)),
      }
    }),

    create: protectedProcedure
      .input(z.object({ body: z.string(), imageUrl: z.string().nullable().optional() }))
      .mutation(async ({ ctx, input }) => {
        const body = clipBody(input.body)
        if (!body && !input.imageUrl) throw new TRPCError({ code: 'BAD_REQUEST' })
        const post = await prisma.post.create({
          data: { authorId: ctx.user.id, body, imageUrl: input.imageUrl || null },
          include: postInclude,
        })
        return mapPost(post, ctx.user.id)
      }),

    like: protectedProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId: ctx.user.id, postId: input.postId } },
      })
      const post = await prisma.post.findUnique({ where: { id: input.postId } })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' })
      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } })
      } else {
        await prisma.like.create({ data: { userId: ctx.user.id, postId: input.postId } })
        await notify(post.authorId, ctx.user.id, 'like', post.id)
      }
      return { liked: !existing }
    }),

    comment: protectedProcedure
      .input(z.object({ postId: z.string(), body: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const body = clipBody(input.body, 220)
        if (!body) throw new TRPCError({ code: 'BAD_REQUEST' })
        const post = await prisma.post.findUnique({ where: { id: input.postId } })
        if (!post) throw new TRPCError({ code: 'NOT_FOUND' })
        await prisma.comment.create({ data: { userId: ctx.user.id, postId: input.postId, body } })
        await notify(post.authorId, ctx.user.id, 'comment', post.id)
        return { ok: true }
      }),

    repost: protectedProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
      const source = await prisma.post.findUnique({ where: { id: input.postId } })
      if (!source) throw new TRPCError({ code: 'NOT_FOUND' })
      const post = await prisma.post.create({
        data: {
          authorId: ctx.user.id,
          body: '',
          repostOfId: source.repostOfId || source.id,
        },
        include: postInclude,
      })
      await notify(source.authorId, ctx.user.id, 'repost', source.id)
      return mapPost(post, ctx.user.id)
    }),
  }),

  follow: router({
    toggle: protectedProcedure.input(z.object({ handle: z.string() })).mutation(async ({ ctx, input }) => {
      const target = await prisma.user.findUnique({ where: { handle: input.handle } })
      if (!target || !canFollow(ctx.user.id, target.id)) throw new TRPCError({ code: 'BAD_REQUEST' })
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: ctx.user.id, followingId: target.id } },
      })
      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } })
        return { following: false }
      }
      await prisma.follow.create({ data: { followerId: ctx.user.id, followingId: target.id } })
      await notify(target.id, ctx.user.id, 'follow')
      return { following: true }
    }),

    people: publicProcedure.query(async ({ ctx }) => {
      const users = await prisma.user.findMany({ orderBy: { name: 'asc' } })
      const following = ctx.user
        ? await prisma.follow.findMany({
            where: { followerId: ctx.user.id },
            select: { followingId: true },
          })
        : []
      const ids = new Set(following.map((item) => item.followingId))
      return users
        .filter((item) => item.id !== ctx.user?.id)
        .map((item) => ({ ...publicUser(item), following: ids.has(item.id) }))
    }),
  }),

  notify: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await prisma.notification.findMany({
        where: { userId: ctx.user.id },
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })
      return items.map((item) => ({
        id: item.id,
        kind: item.kind,
        read: item.read,
        createdAt: item.createdAt.toISOString(),
        postId: item.postId,
        actor: publicUser(item.actor),
      }))
    }),
    markRead: protectedProcedure.mutation(async ({ ctx }) => {
      await prisma.notification.updateMany({ where: { userId: ctx.user.id, read: false }, data: { read: true } })
      return { ok: true }
    }),
  }),

  message: router({
    inbox: protectedProcedure.query(async ({ ctx }) => {
      const lines = await prisma.message.findMany({
        where: { OR: [{ senderId: ctx.user.id }, { receiverId: ctx.user.id }] },
        include: { sender: true, receiver: true },
        orderBy: { createdAt: 'desc' },
        take: 120,
      })
      const seen = new Set<string>()
      const threads: { key: string; peer: ReturnType<typeof publicUser>; last: string; preview: string }[] = []
      for (const line of lines) {
        const peer = line.senderId === ctx.user.id ? line.receiver : line.sender
        const key = threadKey(line.senderId, line.receiverId)
        if (seen.has(key)) continue
        seen.add(key)
        threads.push({
          key,
          peer: publicUser(peer),
          last: line.createdAt.toISOString(),
          preview: line.body,
        })
      }
      return threads
    }),

    thread: protectedProcedure.input(z.object({ peerId: z.string() })).query(async ({ ctx, input }) => {
      const peer = await prisma.user.findUnique({ where: { id: input.peerId } })
      if (!peer) throw new TRPCError({ code: 'NOT_FOUND' })
      const lines = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: ctx.user.id, receiverId: input.peerId },
            { senderId: input.peerId, receiverId: ctx.user.id },
          ],
        },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      })
      return {
        peer: publicUser(peer),
        lines: lines.map((line) => ({
          id: line.id,
          body: line.body,
          createdAt: line.createdAt.toISOString(),
          mine: line.senderId === ctx.user.id,
          sender: publicUser(line.sender),
        })),
      }
    }),

    send: protectedProcedure
      .input(z.object({ peerId: z.string(), body: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const body = clipBody(input.body, 400)
        if (!body || input.peerId === ctx.user.id) throw new TRPCError({ code: 'BAD_REQUEST' })
        await prisma.message.create({
          data: { senderId: ctx.user.id, receiverId: input.peerId, body },
        })
        await notify(input.peerId, ctx.user.id, 'message')
        await publishUser(ctx.user.id, { type: 'message' })
        return { ok: true }
      }),
  }),
})

export type AppRouter = typeof appRouter
