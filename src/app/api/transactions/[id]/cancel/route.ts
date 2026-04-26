import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { canTransitionTo } from '@/lib/transaction-rules'
import type { ActorRole } from '@/lib/transaction-rules'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const userId = session.user.id
  const { id } = await params

  const transaction = await db.transaction.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true, listingId: true, status: true },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
  }

  let actorRole: ActorRole
  if (userId === transaction.buyerId) {
    actorRole = 'buyer'
  } else if (userId === transaction.sellerId) {
    actorRole = 'seller'
  } else {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const check = canTransitionTo(transaction.status, 'CANCELLED', actorRole)
  if (check !== true) {
    return NextResponse.json({ error: check.error }, { status: 400 })
  }

  // TODO (Sprint 4): PAID cancellation by seller should trigger payment refund via gateway
  const shouldRestoreListing =
    transaction.status === 'PENDING' || transaction.status === 'PAID'

  const updated = await db.$transaction(async (tx) => {
    if (shouldRestoreListing) {
      await tx.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'ACTIVE' },
      })
    }
    return tx.transaction.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    })
  })

  return NextResponse.json({ transaction: updated })
}
