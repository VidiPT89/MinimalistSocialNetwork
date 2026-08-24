'use client'

import { NoticeBell } from '@/components/feed/NoticeBell'
import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export function SiteChrome({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useLocale()
  const { data, refresh } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  async function signIn(userId: string) {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    await refresh()
    router.push('/feed')
  }

  async function signOut() {
    await fetch('/api/session', { method: 'DELETE' })
    await refresh()
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="sticky top-4 z-20 mx-auto w-[min(1280px,calc(100%-1.5rem))]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-[#f4e6c8]/12 bg-black/70 px-4 py-2 backdrop-blur-md">
          <Link href="/" className="display text-xl tracking-[0.28em] text-[#ffaa00]">
            {t.brand}
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {data.user ? (
              <>
                <Link href="/feed" className={pathname === '/feed' ? 'btn' : 'btn-ghost'}>
                  {t.feed}
                </Link>
                <Link href="/messages" className={pathname === '/messages' ? 'btn' : 'btn-ghost'}>
                  {t.messages}
                </Link>
                {data.user ? (
                  <Link href={`/u/${data.user.handle}`} className={pathname === `/u/${data.user.handle}` ? 'btn' : 'btn-ghost'}>
                    {t.me}
                  </Link>
                ) : null}
                <NoticeBell />
                <button type="button" className="btn-ghost" onClick={() => void signOut()}>
                  {t.signOut}
                </button>
              </>
            ) : (
              <select
                className="field w-auto py-1"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) void signIn(event.target.value)
                }}
              >
                <option value="">{t.signIn}</option>
                {data.demoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex overflow-hidden rounded-full border border-[#f4e6c8]/25">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'pt' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('pt')}
              >
                PT
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'en' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
          </nav>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto w-[min(1280px,calc(100%-1.5rem))] py-10"
      >
        {children}
      </motion.main>

      <footer className="mx-auto mt-8 w-[min(1280px,calc(100%-1.5rem))] border-t border-[#f4e6c8]/10 py-10 text-center text-sm text-[#f4e6c8]/70">
        <p className="display text-lg tracking-[0.28em] text-[#ffaa00]">{t.brand}</p>
        <p className="mt-2">{t.tagline}</p>
        <p className="mt-4">{t.developed}</p>
        <p className="mt-2 flex justify-center gap-4">
          <a href="https://ividi.dev/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            ividi.dev
          </a>
          <a href="https://github.com/VidiPT89/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
