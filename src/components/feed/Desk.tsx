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
  const [scope, setScope] = useState<'following' | 'all'>('following')
  const feed = trpc.post.feed.useQuery({ scope })
  const refresh = useCallback(() => {
    void feed.refetch()
  }, [feed])

  useFioLive(data.user?.id ?? null, refresh)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button type="button" className={scope === 'following' ? 'btn' : 'btn-ghost'} onClick={() => setScope('following')}>
            {t.feed}
          </button>
          <button type="button" className={scope === 'all' ? 'btn' : 'btn-ghost'} onClick={() => setScope('all')}>
            {t.all}
          </button>
        </div>
        {data.user ? <Composer onPosted={refresh} /> : null}
        {feed.data?.length ? (
          feed.data.map((post) => <PostCard key={post.id} post={post} onChange={refresh} />)
        ) : (
          <p className="rounded-2xl border border-[#f4e6c8]/10 p-6 text-[#f4e6c8]/60">{t.emptyFeed}</p>
        )}
      </div>
      <PeopleRail onChange={refresh} />
    </div>
  )
}
