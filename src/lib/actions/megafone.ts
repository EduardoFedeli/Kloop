"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type MegafoneActionResult =
  | { success: true }
  | {
      success: false
      error: string
      discountRequired?: true
      requiredPriceCents?: number
      originalPriceCents?: number
    }

function msInDays(ms: number) {
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function sevenDaysFromNow(from: Date) {
  return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)
}

export async function applyMegafoneAction(
  listingId: string,
  newPriceCents?: number
): Promise<MegafoneActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const userId = session.user.id

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, priceCents: true, createdAt: true, status: true, slug: true },
  })

  if (!listing) return { success: false, error: "Anúncio não encontrado" }
  if (listing.sellerId !== userId) return { success: false, error: "Sem permissão" }
  if (listing.status !== "ACTIVE")
    return { success: false, error: "Apenas anúncios ativos podem ser megafonados" }

  // Mandatory discount rules based on listing age
  const now = new Date()
  const ageInDays = msInDays(now.getTime() - listing.createdAt.getTime())

  let requiredDiscountCents = 0
  if (ageInDays >= 29) {
    requiredDiscountCents = Math.min(Math.round(listing.priceCents * 0.1), 5000)
  } else if (ageInDays >= 8) {
    requiredDiscountCents = Math.min(Math.round(listing.priceCents * 0.05), 5000)
  }

  const maxAllowedPriceCents = listing.priceCents - requiredDiscountCents

  if (requiredDiscountCents > 0 && newPriceCents === undefined) {
    return {
      success: false,
      error: "Desconto obrigatório não aplicado",
      discountRequired: true,
      requiredPriceCents: maxAllowedPriceCents,
      originalPriceCents: listing.priceCents,
    }
  }

  if (newPriceCents !== undefined) {
    if (newPriceCents <= 0) return { success: false, error: "Preço inválido" }
    if (newPriceCents > maxAllowedPriceCents) {
      return {
        success: false,
        error: `O preço deve ser no máximo R$ ${(maxAllowedPriceCents / 100).toFixed(2).replace(".", ",")} para megafonar este anúncio`,
        discountRequired: true,
        requiredPriceCents: maxAllowedPriceCents,
        originalPriceCents: listing.priceCents,
      }
    }
  }

  // Load subscription quota
  const sub = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: { select: { megaphonesPerWeek: true } } },
  })

  if (!sub) return { success: false, error: "Assinatura não encontrada" }

  const megaphonesPerWeek = sub.plan?.megaphonesPerWeek ?? 5
  const extraBalance = sub.extraMegaphonesBalance
  const needsReset = !sub.megaphonesWeekResetAt || sub.megaphonesWeekResetAt <= now
  const usedThisWeek = needsReset ? 0 : sub.megaphonesUsedThisWeek

  const planAvailable = Math.max(0, megaphonesPerWeek - usedThisWeek)
  const totalAvailable = planAvailable + extraBalance

  if (totalAvailable <= 0) {
    return {
      success: false,
      error: "Você não tem megafones disponíveis. Compre mais ou aguarde o reset semanal.",
    }
  }

  const megafonadoUntil = sevenDaysFromNow(now)

  await db.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingId },
      data: {
        isMegafonado: true,
        megafonadoUntil,
        ...(newPriceCents !== undefined ? { priceCents: newPriceCents } : {}),
      },
    })

    if (needsReset) {
      await tx.userSubscription.update({
        where: { userId },
        data: {
          megaphonesWeekResetAt: sevenDaysFromNow(now),
          megaphonesUsedThisWeek: planAvailable > 0 ? 1 : 0,
          extraMegaphonesBalance: planAvailable > 0 ? extraBalance : extraBalance - 1,
        },
      })
    } else if (planAvailable > 0) {
      await tx.userSubscription.update({
        where: { userId },
        data: { megaphonesUsedThisWeek: { increment: 1 } },
      })
    } else {
      await tx.userSubscription.update({
        where: { userId },
        data: { extraMegaphonesBalance: { decrement: 1 } },
      })
    }

    await tx.storeBoost.create({
      data: {
        userId,
        listingId,
        boostType: "MEGAPHONE",
        startDate: now,
        endDate: megafonadoUntil,
        creditsSpent: 1,
        isActive: true,
      },
    })
  })

  revalidatePath(`/listing/${listing.slug}`)
  revalidatePath('/profile', 'layout')
  revalidatePath("/vendas/megafone")
  return { success: true }
}

export async function buyExtraMegaphonesAction(): Promise<MegafoneActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const userId = session.user.id

  const sub = await db.userSubscription.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!sub) return { success: false, error: "Assinatura não encontrada" }

  await db.userSubscription.update({
    where: { userId },
    data: { extraMegaphonesBalance: { increment: 5 } },
  })

  revalidatePath("/vendas/megafone")
  return { success: true }
}
