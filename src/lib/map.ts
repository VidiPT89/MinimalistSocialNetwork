import type { Comment, Like, Post, User } from '@prisma/client'
import type { PostCard, PublicUser } from './types'

type Author = User
type MappedPost = Post & {
  author: Author
  likes: Like[]
  comments: (Comment & { user: Author })[]
  _count: { likes: number; comments: number; reposts: number }
  repostOf: (Post & { author: Author }) | null
}

export function publicUser(user: Author): PublicUser {
  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    bio: user.bio,
    bioEn: user.bioEn,
    hue: user.hue,
  }
}

export function mapPost(post: MappedPost, viewerId?: string | null): PostCard {
  return {
    id: post.id,
    body: post.body,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    repostCount: post._count.reposts,
    liked: viewerId ? post.likes.some((item) => item.userId === viewerId) : false,
    author: publicUser(post.author),
    original: post.repostOf
      ? {
          id: post.repostOf.id,
          body: post.repostOf.body,
          imageUrl: post.repostOf.imageUrl,
          author: publicUser(post.repostOf.author),
        }
      : null,
    comments: post.comments.map((item) => ({
      id: item.id,
      body: item.body,
      createdAt: item.createdAt.toISOString(),
      author: publicUser(item.user),
    })),
  }
}

export const postInclude = {
  author: true,
  likes: true,
  comments: { include: { user: true }, orderBy: { createdAt: 'asc' as const } },
  _count: { select: { likes: true, comments: true, reposts: true } },
  repostOf: { include: { author: true } },
}
