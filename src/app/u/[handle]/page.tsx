import { ProfileDesk } from '@/components/feed/ProfileDesk'

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  return <ProfileDesk handle={handle} />
}
