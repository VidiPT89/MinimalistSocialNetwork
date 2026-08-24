export type PublicUser = {
  id: string
  handle: string
  name: string
  bio: string
  bioEn: string
  hue: string
}

export type SessionPayload = {
  user: PublicUser | null
  demoUsers: PublicUser[]
}

export type PostCard = {
  id: string
  body: string
  imageUrl: string | null
  createdAt: string
  likeCount: number
  commentCount: number
  repostCount: number
  liked: boolean
  saved: boolean
  author: PublicUser
  original: {
    id: string
    body: string
    imageUrl: string | null
    author: PublicUser
  } | null
  comments: { id: string; body: string; createdAt: string; author: PublicUser }[]
}

export type Notice = {
  id: string
  kind: string
  read: boolean
  createdAt: string
  actor: PublicUser
  postId: string | null
}

export type ChatLine = {
  id: string
  body: string
  createdAt: string
  mine: boolean
  sender: PublicUser
}
