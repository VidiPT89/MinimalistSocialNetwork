'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { remainingChars } from '@/lib/social'
import { trpc } from '@/trpc/client'
import { useState } from 'react'

export function Composer({ onPosted }: { onPosted: () => void }) {
  const { t } = useLocale()
  const create = trpc.post.create.useMutation()
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const left = remainingChars(body)

  function onFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function publish() {
    if ((!body.trim() && !imageUrl) || left < 0) return
    await create.mutateAsync({ body, imageUrl })
    setBody('')
    setImageUrl(null)
    onPosted()
  }

  return (
    <section className="rounded-[1.8rem] border border-[#f4e6c8]/12 bg-black/50 p-5">
      <textarea
        className="field min-h-28"
        value={body}
        maxLength={320}
        onChange={(event) => setBody(event.target.value.slice(0, 280))}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void publish()
        }}
        placeholder={t.composer}
      />
      {imageUrl ? (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="max-h-48 w-full rounded-2xl object-cover" />
          <button type="button" className="btn-ghost absolute right-3 top-3 bg-black/70" onClick={() => setImageUrl(null)}>
            {t.removeImage}
          </button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="btn-ghost cursor-pointer">
          {t.image}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </label>
        <div className="flex items-center gap-3">
          <span className={`text-xs tabular-nums ${left < 20 ? 'text-[#ff7a00]' : 'text-[#f4e6c8]/45'}`}>
            {left} {t.left}
          </span>
          <button type="button" className="btn" disabled={create.isPending} onClick={() => void publish()}>
            {t.publish}
          </button>
        </div>
      </div>
    </section>
  )
}
