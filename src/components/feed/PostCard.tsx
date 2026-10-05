'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useNow } from '@/lib/now'
import { timeAgo } from '@/lib/social'
import type { PostCard as Card } from '@/lib/types'
import { trpc } from '@/trpc/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export function PostCard({ post, onChange }: { post: Card; onChange: () => void }) {
  const { t, locale } = useLocale()
  const now = useNow()
  const like = trpc.post.like.useMutation()
  const comment = trpc.post.comment.useMutation()
  const repost = trpc.post.repost.useMutation()
  const bookmark = trpc.post.bookmark.useMutation()
  const [body, setBody] = useState('')

  async function onLike() {
    await like.mutateAsync({ postId: post.id })
    onChange()
  }

  async function onRepost() {
    await repost.mutateAsync({ postId: post.original?.id || post.id })
    onChange()
  }

  async function onSave() {
    await bookmark.mutateAsync({ postId: post.id })
    onChange()
  }

  async function onComment() {
    if (!body.trim()) return
    await comment.mutateAsync({ postId: post.id, body })
    setBody('')
    onChange()
  }

  const shown = post.original || { body: post.body, imageUrl: post.imageUrl, author: post.author, id: post.id }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.6rem] border border-[#f4e6c8]/12 bg-black/45 p-5"
    >
      {post.original ? (
        <p className="mb-2 text-xs tracking-[0.14em] text-[#ffaa00]">
          {post.author.name} · {t.repost}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <Link href={`/u/${shown.author.handle}`} className="display text-2xl text-[#f4e6c8] hover:text-[#ffaa00]">
          {shown.author.name}
        </Link>
        <span className="text-xs text-[#f4e6c8]/45">
          @{shown.author.handle} · {timeAgo(post.createdAt, now, locale)}
        </span>
      </div>
      {shown.body ? <p className="mt-3 max-w-prose whitespace-pre-wrap text-[#f4e6c8]/85">{shown.body}</p> : null}
      {shown.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown.imageUrl} alt="" className="mt-4 max-h-80 w-full rounded-2xl object-cover" />
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button type="button" className={post.liked ? 'btn' : 'btn-ghost'} onClick={() => void onLike()}>
          {t.like} {post.likeCount}
        </button>
        <button type="button" className="btn-ghost" onClick={() => void onRepost()}>
          {t.repost} {post.repostCount}
        </button>
        <span className="btn-ghost">
          {t.comment} {post.commentCount}
        </span>
        <button type="button" className={post.saved ? 'btn' : 'btn-ghost'} onClick={() => void onSave()}>
          {post.saved ? t.unsave : t.save}
        </button>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-[#f4e6c8]/75">
        {post.comments.map((item) => (
          <li key={item.id}>
            <Link href={`/u/${item.author.handle}`} className="text-[#ff7a00]">
              {item.author.name}
            </Link>
            <span className="ml-2">{item.body}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          className="field"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void onComment()
            }
          }}
          placeholder={t.reply}
        />
        <button type="button" className="btn" onClick={() => void onComment()}>
          {t.send}
        </button>
      </div>
    </motion.article>
  )
}
