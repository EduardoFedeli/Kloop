import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await (db as any).totemToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true } } },
  })

  if (!record) {
    return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 })
  }

  if (record.status === 'PENDING' && new Date() > new Date(record.expiresAt)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).totemToken.update({ where: { token }, data: { status: 'EXPIRED' } })
    return NextResponse.json({ status: 'EXPIRED' })
  }

  if (record.status === 'CONFIRMED' && record.user) {
    const hasAccess = await db.communityMember.findFirst({
      where: { communityId: record.communityId, userId: record.userId, status: 'ACTIVE' },
    })
    return NextResponse.json({
      status: 'CONFIRMED',
      user: { id: record.user.id, name: record.user.name, hasAccess: !!hasAccess },
    })
  }

  return NextResponse.json({ status: record.status })
}
