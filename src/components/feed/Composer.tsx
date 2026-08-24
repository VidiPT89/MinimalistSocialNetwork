'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { trpc } from '@/trpc/client'
import { useState } from 'react'

export function Composer({ onPosted }: { onPosted: () => void }) {
  const { t } = useLocale()
  const create = trpc.post.create.useMutation()
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  function onFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function publish() {
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
        onChange={(event) => setBody(event.target.value)}
        placeholder={t.composer}
      />
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mt-3 max-h-48 w-full rounded-2xl object-cover" />
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
        <button type="button" className="btn" onClick={() => void publish()}>
          {t.publish}
        </button>
      </div>
    </section>
  )
}
