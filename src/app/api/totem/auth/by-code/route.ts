import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }

  const body = await req.json() as { numericCode?: string }
  const { numericCode } = body

  if (!numericCode || !/^\d{6}$/.test(numericCode)) {
    return NextResponse.json({ error: 'código inválido' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (db as any).totemToken.findFirst({
    where: { numericCode, status: 'PENDING' },
  })

  if (!record) {
    return NextResponse.json({ error: 'código não encontrado ou já utilizado' }, { status: 404 })
  }

  if (new Date() > new Date(record.expiresAt)) {
    return NextResponse.json({ error: 'código expirado' }, { status: 410 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).totemToken.update({
    where: { id: record.id },
    data: { userId: session.user.id, status: 'CONFIRMED', confirmedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
