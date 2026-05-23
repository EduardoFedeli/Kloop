import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateNumericCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { communityId?: string }
    const { communityId } = body

    if (!communityId) {
      return NextResponse.json({ error: 'communityId obrigatório' }, { status: 400 })
    }

    const community = await db.community.findUnique({ where: { id: communityId } })
    if (!community) {
      return NextResponse.json({ error: 'comunidade não encontrada' }, { status: 404 })
    }

    const numericCode = generateNumericCode()
    const expiresAt = new Date(Date.now() + 60 * 1000)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenRecord = await (db as any).totemToken.create({
      data: { communityId, expiresAt, numericCode },
    })

    const baseUrl = req.nextUrl.origin
    const authUrl = `${baseUrl}/api/totem/auth/${tokenRecord.token}?code=${numericCode}`

    return NextResponse.json({ token: tokenRecord.token, numericCode, authUrl })
  } catch (err) {
    console.error('[totem/session] erro ao criar token:', err)
    return NextResponse.json({ error: 'erro interno ao criar sessão de totem' }, { status: 500 })
  }
}
