"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateLotCode(): string {
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = String(date.getFullYear()).slice(-2)
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7)
  return `PRO-${dd}${mm}${yy}${rand}`
}

export async function createProLot(
  shippingMethod: "CORREIOS" | "COLETA",
  withBag: boolean
): Promise<{ code: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const pendingLot = await db.proLot.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "RECEIVED", "ANALYZING"] },
    },
  })

  if (pendingLot) {
    return { error: "Você já tem um lote em andamento. Aguarde a análise para enviar um novo." }
  }

  let code = generateLotCode()
  while (await db.proLot.findUnique({ where: { code } })) {
    code = generateLotCode()
  }

  await db.proLot.create({
    data: { userId: session.user.id, code, shippingMethod, withBag },
  })

  return { code }
}
