import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { canTransitionTo } from '@/lib/transaction-rules'
import { creditCashback, calcSellerCashback, calcBuyerCashback } from '@/lib/cashback'
import { CashbackTransactionType } from '@prisma/client'
import { notifyUser } from '@/lib/notify'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const transaction = await db.transaction.findUnique({
    where: { id },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      status: true,
      listing: { select: { priceCents: true, title: true } },
    },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
  }

  if (transaction.buyerId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const check = canTransitionTo(transaction.status, 'COMPLETED', 'buyer')
  if (check !== true) {
    return NextResponse.json({ error: check.error }, { status: 400 })
  }

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.transaction.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    await creditCashback(tx, {
      userId: transaction.sellerId,
      type: CashbackTransactionType.CREDIT_SELLER,
      amountCents: calcSellerCashback(transaction.listing.priceCents),
      description: `Cashback de vendedor — venda #${id.slice(-6)}`,
      transactionId: id,
    })

    await creditCashback(tx, {
      userId: transaction.buyerId,
      type: CashbackTransactionType.CREDIT_BUYER,
      amountCents: calcBuyerCashback(transaction.listing.priceCents),
      description: `Cashback de comprador — compra #${id.slice(-6)}`,
      transactionId: id,
    })

    return result
  })

  void notifyUser({
    userId: transaction.sellerId,
    type: 'SALE_COMPLETED',
    title: 'Venda concluída!',
    content: `O comprador confirmou o recebimento de "${transaction.listing.title}". O valor já está disponível.`,
    actionUrl: '/vendas',
  })

  return NextResponse.json({ transaction: updated })
}
