import { db } from '@/lib/db'
import type { NotificationType } from '@prisma/client'

type NotifyParams = {
  userId: string
  type: NotificationType
  title: string
  content: string
  actionUrl?: string
}

export async function notifyUser(params: NotifyParams): Promise<void> {
  await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      content: params.content,
      actionUrl: params.actionUrl ?? null,
    },
  })
}

export async function notifyMany(
  userIds: string[],
  params: Omit<NotifyParams, 'userId'>,
): Promise<void> {
  if (userIds.length === 0) return
  await db.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      content: params.content,
      actionUrl: params.actionUrl ?? null,
    })),
  })
}

export function formatPriceBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}
