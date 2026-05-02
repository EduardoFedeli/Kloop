import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

const TWENTY_MINUTES_IN_SECONDS = 60 * 20
const TWENTY_MINUTES_IN_MS = TWENTY_MINUTES_IN_SECONDS * 1000

export async function POST(_req: Request, { params }: RouteParams) {
  const { id: listingId } = await params

  const session = await auth()
  const cookieStore = await cookies()
  const cookieName = `kloop_viewed_${listingId}`

  // 1. Busca o anúncio para verificar se existe e pegar o dono
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  })

  if (!listing) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 })
  }

  // 2. O vendedor não infla as views do próprio anúncio
  const userId = session?.user?.id
  if (userId && userId === listing.sellerId) {
    return new NextResponse(null, { status: 204 })
  }

  let shouldIncrementViewCount = false

  // 3. Regra para Usuários Logados (salva histórico)
  if (userId) {
    const existingView = await db.viewHistory.findUnique({
      where: {
        userId_listingId: { userId, listingId }
      }
    })

    const now = new Date()

    if (existingView) {
      const diffInMs = now.getTime() - existingView.viewedAt.getTime()

      if (diffInMs > TWENTY_MINUTES_IN_MS) {
        // Mais de 20 minutos: Atualiza data pro topo do histórico e manda incrementar views globais
        await db.viewHistory.update({
          where: { id: existingView.id },
          data: { viewedAt: now }
        })
        shouldIncrementViewCount = true
      } else {
        // Menos de 20 minutos: Só atualiza a data pro topo do histórico da pessoa
        await db.viewHistory.update({
          where: { id: existingView.id },
          data: { viewedAt: now }
        })
      }
    } else {
      // Primeira vez vendo esse produto: Cria histórico e manda incrementar views
      await db.viewHistory.create({
        data: { userId, listingId }
      })
      shouldIncrementViewCount = true
    }
  } 
  // 4. Regra para Visitantes Não Logados (Usa Cookie)
  else {
    if (!cookieStore.has(cookieName)) {
      shouldIncrementViewCount = true
    }
  }

  // 5. Se passou nas regras de tempo, incrementa de fato no produto
  if (shouldIncrementViewCount) {
    await db.listing.update({
      where: { id: listingId },
      data: { viewsCount: { increment: 1 } },
    })
  }

  // 6. Atualiza o cookie de qualquer forma (pra manter a sessão coesa)
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set(cookieName, "1", {
    maxAge: TWENTY_MINUTES_IN_SECONDS,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  })
  
  return response
}