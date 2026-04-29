import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { canTransitionTo } from '@/lib/transaction-rules'
import { debitCashback, calcMaxUsage } from '@/lib/cashback'
import { cashbackPaySchema } from '@/lib/validators/cashback'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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
      listingId: true,
      amountCents: true,
      status: true,
      listing: { select: { priceCents: true } },
    },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
  }

  if (transaction.buyerId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const check = canTransitionTo(transaction.status, 'PAID', 'buyer')
  if (check !== true) {
    return NextResponse.json({ error: check.error }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = cashbackPaySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const { cashbackUsedCents } = parsed.data
  const cap = calcMaxUsage(transaction.listing.priceCents)

  if (cashbackUsedCents > cap) {
    return NextResponse.json({ error: 'Cashback excede o limite permitido' }, { status: 400 })
  }

  try {
    const updated = await db.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'SOLD' },
      })

      if (cashbackUsedCents > 0) {
        await debitCashback(tx, {
          userId: transaction.buyerId,
          amountCents: cashbackUsedCents,
          transactionId: id,
          description: `Cashback usado na compra #${id.slice(-6)}`,
        })
      }

      return tx.transaction.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          cashbackUsedCents,
        },
      })
    })

    return NextResponse.json({ transaction: updated })
  } catch (err) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_CASHBACK') {
      return NextResponse.json({ error: 'Saldo de cashback insuficiente' }, { status: 400 })
    }
    throw err
  }
}
