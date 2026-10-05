'use client'

import { readJson } from '@/lib/http'
import type { SessionPayload } from '@/lib/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const empty: SessionPayload = { user: null, demoUsers: [] }

type Ctx = {
  data: SessionPayload
  refresh: () => Promise<void>
}

const SessionContext = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SessionPayload>(empty)

  const refresh = useCallback(async () => {
    setData(await readJson(await fetch('/api/session'), empty))
  }, [])

  // Initial load: setState only in the promise callback, and a late reply after unmount is dropped.
  useEffect(() => {
    let ignore = false
    fetch('/api/session')
      .then((res) => readJson(res, empty))
      .then((next) => {
        if (!ignore) setData(next)
      })
      .catch(() => {
        /* offline: keep the empty session */
      })
    return () => {
      ignore = true
    }
  }, [])

  const value = useMemo(() => ({ data, refresh }), [data, refresh])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('SessionProvider missing')
  return ctx
}
