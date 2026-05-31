"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")
  return session.user.id
}

export async function approveLotItem(
  itemId: string,
  suggestedPriceCents: number
): Promise<{ ok: true } | { error: string }> {
  try {
    await requireAdmin()
    await db.proLotItem.update({
      where: { id: itemId },
      data: { status: "APPROVED", suggestedPriceCents },
    })
    revalidatePath("/admin/lotes")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao aprovar" }
  }
}

export async function rejectLotItem(
  itemId: string,
  adminNote?: string
): Promise<{ ok: true } | { error: string }> {
  try {
    await requireAdmin()
    await db.proLotItem.update({
      where: { id: itemId },
      data: { status: "REJECTED", adminNote: adminNote ?? null },
    })
    revalidatePath("/admin/lotes")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao rejeitar" }
  }
}

// Só ativa o lote — NÃO publica na Kloop Shop ainda.
// O usuário precisa confirmar cada item aprovado.
export async function finalizeLot(lotId: string): Promise<{ ok: true } | { error: string }> {
  try {
    await requireAdmin()

    const lot = await db.proLot.findUnique({ where: { id: lotId } })
    if (!lot) return { error: "Lote não encontrado" }

    await db.proLot.update({ where: { id: lotId }, data: { status: "ACTIVE" } })

    revalidatePath("/admin/lotes")
    revalidatePath("/pro/dashboard")
    revalidatePath("/vendas")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao finalizar lote" }
  }
}

// Usuário confirma um item aprovado pelo admin.
// "PUBLISH" → cria KloopShopProduct e publica.
// "DONATE" / "RETURN" → registra decisão, não publica.
export async function userConfirmItem(
  itemId: string,
  choice: "PUBLISH" | "DONATE" | "RETURN"
): Promise<{ ok: true } | { error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado" }

    const item = await db.proLotItem.findUnique({
      where: { id: itemId },
      include: {
        lot: { select: { userId: true } },
        shopProduct: { select: { id: true } },
      },
    })
    if (!item || item.lot.userId !== session.user.id) return { error: "Item não encontrado" }
    if (item.status !== "APPROVED") return { error: "Este item não foi aprovado pelo admin" }

    if (choice === "PUBLISH") {
      await db.kloopShopProduct.upsert({
        where: { lotItemId: itemId },
        create: {
          lotItemId: itemId,
          name: item.name,
          description: item.description,
          priceCents: item.suggestedPriceCents!,
          condition: item.condition,
        },
        update: { priceCents: item.suggestedPriceCents! },
      })
      revalidatePath("/kloop-shop")
      revalidatePath("/admin/kloop-shop")
    } else {
      await db.proLotItem.update({
        where: { id: itemId },
        data: { userDecision: choice === "DONATE" ? "DONATE" : "RETURN" },
      })
    }

    revalidatePath("/pro/dashboard")
    revalidatePath("/vendas")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao confirmar item" }
  }
}

export async function updateShopProduct(
  productId: string,
  data: { name?: string; priceCents?: number; description?: string; isActive?: boolean }
): Promise<{ ok: true } | { error: string }> {
  try {
    await requireAdmin()
    await db.kloopShopProduct.update({ where: { id: productId }, data })
    revalidatePath("/admin/kloop-shop")
    revalidatePath("/kloop-shop")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao atualizar produto" }
  }
}

export async function deleteShopProduct(productId: string): Promise<{ ok: true } | { error: string }> {
  try {
    await requireAdmin()
    await db.kloopShopProduct.delete({ where: { id: productId } })
    revalidatePath("/admin/kloop-shop")
    revalidatePath("/kloop-shop")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao remover produto" }
  }
}

export async function setUserItemDecision(
  itemId: string,
  decision: "DONATE" | "RETURN"
): Promise<{ ok: true } | { error: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado" }

    const item = await db.proLotItem.findUnique({
      where: { id: itemId },
      include: { lot: { select: { userId: true } } },
    })
    if (!item || item.lot.userId !== session.user.id) return { error: "Item não encontrado" }
    if (item.status !== "REJECTED") return { error: "Este item não foi rejeitado" }

    await db.proLotItem.update({ where: { id: itemId }, data: { userDecision: decision } })
    revalidatePath("/pro/dashboard")
    revalidatePath("/vendas")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao registrar decisão" }
  }
}
