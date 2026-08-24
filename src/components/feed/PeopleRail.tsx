'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { trpc } from '@/trpc/client'
import Link from 'next/link'

export function PeopleRail({ onChange }: { onChange: () => void }) {
  const { t, locale } = useLocale()
  const people = trpc.follow.people.useQuery()
  const toggle = trpc.follow.toggle.useMutation()

  return (
    <aside className="rounded-[1.8rem] border border-[#f4e6c8]/12 bg-black/40 p-5">
      <p className="display tracking-[0.2em] text-[#ffaa00]">{t.people}</p>
      <ul className="mt-4 space-y-3">
        {people.data?.map((user) => (
          <li key={user.id} className="rounded-2xl border border-[#f4e6c8]/10 p-3">
            <Link href={`/u/${user.handle}`} className="display text-xl">
              {user.name}
            </Link>
            <p className="text-xs text-[#ff7a00]">@{user.handle}</p>
            <p className="mt-1 text-sm text-[#f4e6c8]/65">{locale === 'pt' ? user.bio : user.bioEn}</p>
            <button
              type="button"
              className="btn mt-3"
              onClick={async () => {
                await toggle.mutateAsync({ handle: user.handle })
                await people.refetch()
                onChange()
              }}
            >
              {user.following ? t.following : t.follow}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
