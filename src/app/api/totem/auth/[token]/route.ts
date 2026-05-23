import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// POST: chamado pelo celular do usuário (deve estar logado no Kloop)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }

  const { token } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (db as any).totemToken.findUnique({ where: { token } })

  if (!record) {
    return NextResponse.json({ error: 'token inválido' }, { status: 404 })
  }

  if (record.status !== 'PENDING' || new Date() > new Date(record.expiresAt)) {
    return NextResponse.json({ error: 'token expirado ou já utilizado' }, { status: 410 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).totemToken.update({
    where: { token },
    data: { userId: session.user.id, status: 'CONFIRMED', confirmedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}

// GET: quando o QR é aberto no browser, redireciona para login com o token como query param
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('totem_token', token)
  loginUrl.searchParams.set('totem_code', code)
  return NextResponse.redirect(loginUrl)
}
