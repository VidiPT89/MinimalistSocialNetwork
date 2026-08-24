'use client'

import { PostCard } from '@/components/feed/PostCard'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { trpc } from '@/trpc/client'
import Link from 'next/link'

export function ProfileDesk({ handle }: { handle: string }) {
  const { t, locale } = useLocale()
  const { data } = useSession()
  const profile = trpc.post.byHandle.useQuery({ handle })
  const toggle = trpc.follow.toggle.useMutation()

  if (!profile.data) return <p className="text-[#f4e6c8]/55">{t.profile}</p>

  const person = profile.data.profile
  const mine = data.user?.handle === person.handle

  return (
    <div className="space-y-5">
      <header className="rounded-[2rem] border border-[#f4e6c8]/12 bg-black/45 p-6">
        <p className="display text-balance text-5xl">{person.name}</p>
        <p className="mt-1 text-[#ff7a00]">@{person.handle}</p>
        <p className="mt-3 max-w-prose text-[#f4e6c8]/75">{locale === 'pt' ? person.bio : person.bioEn}</p>
        <ul className="mt-5 flex flex-wrap gap-4 text-sm text-[#f4e6c8]/70">
          <li>
            <span className="display text-2xl text-[#ffaa00]">{profile.data.posts.length}</span> {t.statsPosts}
          </li>
          <li>
            <span className="display text-2xl text-[#ffaa00]">{profile.data.followers}</span> {t.statsFollowers}
          </li>
          <li>
            <span className="display text-2xl text-[#ffaa00]">{profile.data.followingCount}</span> {t.statsFollowing}
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {!mine && data.user ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  await toggle.mutateAsync({ handle: person.handle })
                  await profile.refetch()
                }}
              >
                {profile.data.following ? t.following : t.follow}
              </button>
              <Link href={`/messages?with=${person.handle}`} className="btn-ghost">
                {t.writeTo}
              </Link>
            </>
          ) : null}
        </div>
      </header>
      {profile.data.posts.map((post) => (
        <PostCard key={post.id} post={post} onChange={() => void profile.refetch()} />
      ))}
    </div>
  )
}
