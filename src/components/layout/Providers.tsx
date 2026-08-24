'use client'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { SessionProvider } from '@/i18n/SessionProvider'
import { TRPCProvider } from '@/trpc/client'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SessionProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </SessionProvider>
    </LocaleProvider>
  )
}
