import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

async function getCount(listingId: string): Promise<number> {
  return db.favorite.count({ where: { listingId } })
}

export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id: listingId } = await params

  await db.favorite.upsert({
    where: { userId_listingId: { userId: session.user.id, listingId } },
    create: { userId: session.user.id, listingId },
    update: {},
  })

  const count = await getCount(listingId)
  return NextResponse.json({ favorited: true, count })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id: listingId } = await params

  await db.favorite.deleteMany({
    where: { userId: session.user.id, listingId },
  })

  const count = await getCount(listingId)
  return NextResponse.json({ favorited: false, count })
}
