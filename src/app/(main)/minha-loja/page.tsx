import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MinhaLojaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')
  redirect(`/profile/${session.user.id}`)
}
