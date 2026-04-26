import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

const SIX_HOURS = 60 * 60 * 6

export async function POST(_req: Request, { params }: RouteParams) {
  const { id: listingId } = await params

  const session = await auth()
  const cookieStore = await cookies()
  const cookieName = `kloop_viewed_${listingId}`

  if (cookieStore.has(cookieName)) {
    return new NextResponse(null, { status: 204 })
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  })

  if (!listing) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 })
  }

  if (session?.user?.id && session.user.id === listing.sellerId) {
    return new NextResponse(null, { status: 204 })
  }

  await db.listing.update({
    where: { id: listingId },
    data: { viewsCount: { increment: 1 } },
  })

  const response = new NextResponse(null, { status: 204 })
  response.cookies.set(cookieName, "1", {
    maxAge: SIX_HOURS,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  })
  return response
}
