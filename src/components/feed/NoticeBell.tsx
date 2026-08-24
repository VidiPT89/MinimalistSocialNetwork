'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { useFioLive } from '@/lib/live'
import { unreadCount } from '@/lib/social'
import { trpc } from '@/trpc/client'
import { useCallback, useState } from 'react'

const labels = {
  like: 'noticeLike',
  comment: 'noticeComment',
  repost: 'noticeRepost',
  follow: 'noticeFollow',
  message: 'noticeMessage',
} as const

export function NoticeBell() {
  const { t } = useLocale()
  const { data } = useSession()
  const list = trpc.notify.list.useQuery(undefined, { enabled: Boolean(data.user) })
  const read = trpc.notify.markRead.useMutation()
  const [open, setOpen] = useState(false)
  const refresh = useCallback(() => {
    void list.refetch()
  }, [list])

  useFioLive(data.user?.id ?? null, refresh)
  const unread = unreadCount(list.data ?? [])

  return (
    <div className="relative">
      <button type="button" className="btn-ghost" onClick={() => setOpen((value) => !value)}>
        {t.notices}
        {unread ? <span className="ml-2 rounded-full bg-[#ff7a00] px-2 text-xs text-black">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-[#f4e6c8]/15 bg-black/95 p-3 text-sm shadow-2xl">
          <button
            type="button"
            className="btn-ghost mb-2 w-full"
            onClick={async () => {
              await read.mutateAsync()
              await list.refetch()
            }}
          >
            {t.markRead}
          </button>
          <ul className="max-h-80 space-y-2 overflow-auto">
            {list.data?.map((item) => (
              <li key={item.id} className={item.read ? 'opacity-55' : ''}>
                <span className="text-[#ff7a00]">{item.actor.name}</span>{' '}
                {t[labels[item.kind as keyof typeof labels] ?? 'noticeLike']}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
