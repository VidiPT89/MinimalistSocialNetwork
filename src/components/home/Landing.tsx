'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'

const feats = ['featPost', 'featSocial', 'featFeed', 'featLive', 'featDm'] as const

export function Landing() {
  const { t } = useLocale()
  const { data } = useSession()

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="display text-sm tracking-[0.32em] text-[#ff7a00]">{t.product}</p>
        <h1 className="display mt-3 text-6xl leading-none text-[#f4e6c8] md:text-8xl">{t.brand}</h1>
        <div className="filament my-6" />
        <p className="max-w-xl text-lg text-[#f4e6c8]/80">{t.heroLead}</p>
        <p className="mt-4 max-w-xl text-sm text-[#f4e6c8]/55">{t.demoHint}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={data.user ? '/feed' : '/'} className="btn">
            {t.enter}
          </Link>
          {data.user ? (
            <Link href="/messages" className="btn-ghost">
              {t.messages}
            </Link>
          ) : null}
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {feats.map((key, index) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index }}
              className="rounded-2xl border border-[#f4e6c8]/12 bg-black/40 px-4 py-3"
            >
              {t[key]}
            </motion.li>
          ))}
        </ul>
      </div>
      <aside className="rounded-[2rem] border border-[#f4e6c8]/12 bg-black/45 p-6">
        <p className="display tracking-[0.2em] text-[#ffaa00]">{t.people}</p>
        <div className="mt-4 space-y-4">
          {data.demoUsers.map((user) => (
            <Link
              key={user.id}
              href={`/u/${user.handle}`}
              className="block rounded-2xl border border-[#f4e6c8]/10 p-4 hover:border-[#ff7a00]/50"
            >
              <p className="display text-2xl">{user.name}</p>
              <p className="text-sm text-[#ff7a00]">@{user.handle}</p>
              <p className="mt-2 text-sm text-[#f4e6c8]/70">{user.bio}</p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-[#f4e6c8]/45">{t.liveHint}</p>
      </aside>
    </div>
  )
}
