import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { canTransitionTo } from '@/lib/transaction-rules'
import { shipTransactionSchema } from '@/lib/validators/transaction'

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
    select: { id: true, sellerId: true, status: true },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
  }

  if (transaction.sellerId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const check = canTransitionTo(transaction.status, 'SHIPPED', 'seller')
  if (check !== true) {
    return NextResponse.json({ error: check.error }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const parsed = shipTransactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    )
  }

  const updated = await db.transaction.update({
    where: { id },
    data: {
      status: 'SHIPPED',
      shippedAt: new Date(),
      trackingCode: parsed.data.trackingCode ?? null,
    },
  })

  return NextResponse.json({ transaction: updated })
}
