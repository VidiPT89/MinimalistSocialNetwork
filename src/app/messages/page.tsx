import { MessagesDesk } from '@/components/feed/MessagesDesk'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <MessagesDesk />
    </Suspense>
  )
}
