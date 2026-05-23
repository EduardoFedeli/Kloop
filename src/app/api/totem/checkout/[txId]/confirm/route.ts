import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ txId: string }> }
) {
  const { txId } = await params

  const transaction = await db.transaction.findUnique({
    where: { id: txId },
    select: { id: true, status: true, listingId: true },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'transação não encontrada' }, { status: 404 })
  }

  if (transaction.status !== 'AWAITING_PAYMENT') {
    return NextResponse.json({ error: 'transação não está aguardando pagamento' }, { status: 400 })
  }

  await db.$transaction([
    db.transaction.update({
      where: { id: txId },
      data: { status: 'PAID', paidAt: new Date() },
    }),
    db.listing.update({
      where: { id: transaction.listingId },
      data: { status: 'SOLD' },
    }),
  ])

  return NextResponse.json({ ok: true })
}
