'use client'

import Pusher from 'pusher-js'
import { useEffect } from 'react'

export function useFioLive(userId: string | null, onEvent: () => void) {
  useEffect(() => {
    if (!userId) return

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu'
    if (key) {
      const pusher = new Pusher(key, { cluster })
      const channel = pusher.subscribe(`fio-user-${userId}`)
      channel.bind('fio', () => onEvent())
      return () => {
        channel.unbind_all()
        pusher.unsubscribe(`fio-user-${userId}`)
        pusher.disconnect()
      }
    }

    const source = new EventSource(`/api/realtime?userId=${userId}`)
    source.onmessage = () => onEvent()
    return () => source.close()
  }, [userId, onEvent])
}
