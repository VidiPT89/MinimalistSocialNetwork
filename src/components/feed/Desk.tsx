'use client'

import { Composer } from '@/components/feed/Composer'
import { PeopleRail } from '@/components/feed/PeopleRail'
import { PostCard } from '@/components/feed/PostCard'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { useFioLive } from '@/lib/live'
import { trpc } from '@/trpc/client'
import { useCallback, useState } from 'react'

export function Desk() {
  const { t } = useLocale()
  const { data } = useSession()
  const [scope, setScope] = useState<'following' | 'all' | 'saved'>('following')
  const [q, setQ] = useState('')
  const feed = trpc.post.feed.useQuery({ scope, q })
  const desk = trpc.post.desk.useQuery(undefined, { enabled: Boolean(data.user) })
  const refresh = useCallback(() => {
    void feed.refetch()
    void desk.refetch()
  }, [feed, desk])

  useFioLive(data.user?.id ?? null, refresh)

  const empty =
    scope === 'saved' ? t.emptySaved : q.trim() ? t.emptySearch : t.emptyFeed

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        {desk.data ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              [t.statsPosts, desk.data.posts],
              [t.statsFollowing, desk.data.following],
              [t.statsFollowers, desk.data.followers],
              [t.statsUnread, desk.data.unread],
              [t.statsSaved, desk.data.saved],
            ].map(([label, value]) => (
              <li key={String(label)} className="rounded-2xl border border-[#f4e6c8]/10 bg-black/35 px-3 py-2">
                <p className="display text-2xl text-[#ffaa00]">{value}</p>
                <p className="text-[11px] text-[#f4e6c8]/55">{label}</p>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(['following', 'all', 'saved'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={scope === item ? 'btn' : 'btn-ghost'}
              onClick={() => setScope(item)}
            >
              {item === 'following' ? t.feed : item === 'all' ? t.all : t.saved}
            </button>
          ))}
        </div>
        <input className="field" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t.search} />
        {data.user ? <Composer onPosted={refresh} /> : null}
        {feed.isLoading ? (
          <div className="space-y-3">
            <div className="h-36 animate-pulse rounded-[1.6rem] bg-[#f4e6c8]/6" />
            <div className="h-36 animate-pulse rounded-[1.6rem] bg-[#f4e6c8]/6" />
          </div>
        ) : feed.data?.length ? (
          feed.data.map((post) => <PostCard key={post.id} post={post} onChange={refresh} />)
        ) : (
          <p className="rounded-2xl border border-[#f4e6c8]/10 p-6 text-[#f4e6c8]/60">{empty}</p>
        )}
      </div>
      <PeopleRail onChange={refresh} />
    </div>
  )
}
