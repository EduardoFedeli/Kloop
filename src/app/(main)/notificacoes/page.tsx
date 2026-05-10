import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getNotifications } from '@/lib/actions/notifications'
import { NotificacoesClient } from '@/components/notificacoes/NotificacoesClient'

export default async function NotificacoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const notifications = await getNotifications()

  const items = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    isRead: n.isRead,
    actionUrl: n.actionUrl,
    createdAt: n.createdAt.toISOString(),
  }))

  return <NotificacoesClient notifications={items} />
}
