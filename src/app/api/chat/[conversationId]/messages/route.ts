import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const { conversationId } = await params

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  })

  if (!participant) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const after = req.nextUrl.searchParams.get("after")
  if (!after) {
    return NextResponse.json([])
  }

  const afterDate = new Date(after)
  if (isNaN(afterDate.getTime())) {
    return NextResponse.json({ error: "invalid_after" }, { status: 400 })
  }

  const messages = await db.message.findMany({
    where: {
      conversationId,
      createdAt: { gt: afterDate },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      createdAt: true,
    },
  })

  return NextResponse.json(
    messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
  )
}
