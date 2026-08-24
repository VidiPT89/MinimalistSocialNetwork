'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { useFioLive } from '@/lib/live'
import { trpc } from '@/trpc/client'
import { useCallback, useState } from 'react'

export function MessagesDesk() {
  const { t } = useLocale()
  const { data } = useSession()
  const inbox = trpc.message.inbox.useQuery(undefined, { enabled: Boolean(data.user) })
  const people = trpc.follow.people.useQuery()
  const [peerId, setPeerId] = useState<string | null>(null)
  const thread = trpc.message.thread.useQuery({ peerId: peerId || '' }, { enabled: Boolean(peerId) })
  const send = trpc.message.send.useMutation()
  const [body, setBody] = useState('')

  const refresh = useCallback(() => {
    void inbox.refetch()
    void thread.refetch()
  }, [inbox, thread])

  useFioLive(data.user?.id ?? null, refresh)

  async function onSend() {
    if (!peerId || !body.trim()) return
    await send.mutateAsync({ peerId, body })
    setBody('')
    refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[1.8rem] border border-[#f4e6c8]/12 bg-black/40 p-4">
        <p className="display tracking-[0.2em] text-[#ffaa00]">{t.messages}</p>
        <ul className="mt-4 space-y-2">
          {(inbox.data?.length ? inbox.data : people.data?.map((peer) => ({ key: peer.id, peer, preview: '', last: '' })))?.map(
            (item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`w-full rounded-2xl border px-3 py-2 text-left ${
                    peerId === item.peer.id ? 'border-[#ff7a00]' : 'border-[#f4e6c8]/10'
                  }`}
                  onClick={() => setPeerId(item.peer.id)}
                >
                  <p className="display text-lg">{item.peer.name}</p>
                  <p className="truncate text-xs text-[#f4e6c8]/55">{item.preview}</p>
                </button>
              </li>
            ),
          )}
        </ul>
      </aside>
      <section className="flex min-h-[28rem] flex-col rounded-[1.8rem] border border-[#f4e6c8]/12 bg-black/45 p-5">
        {peerId && thread.data ? (
          <>
            <p className="display text-3xl">{thread.data.peer.name}</p>
            <div className="filament my-4" />
            <ul className="flex-1 space-y-3 overflow-auto">
              {thread.data.lines.map((line) => (
                <li key={line.id} className={line.mine ? 'text-right' : ''}>
                  <span className={`inline-block rounded-2xl px-3 py-2 ${line.mine ? 'bg-[#ff7a00] text-black' : 'bg-black/60'}`}>
                    {line.body}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <input className="field" value={body} onChange={(event) => setBody(event.target.value)} placeholder={t.write} />
              <button type="button" className="btn" onClick={() => void onSend()}>
                {t.send}
              </button>
            </div>
          </>
        ) : (
          <p className="m-auto text-[#f4e6c8]/55">{t.emptyInbox}</p>
        )}
      </section>
    </div>
  )
}
