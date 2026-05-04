"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function subscribeToPlan(planSlug: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Usuário não autenticado" }
    }

    // Busca o plano no banco pelo slug (ex: "pro", "premium")
    const plan = await db.subscriptionPlan.findUnique({
      where: { slug: planSlug }
    })

    if (!plan) {
      return { error: "Plano não encontrado" }
    }

    const now = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Atualiza ou cria a assinatura do usuário (simulação)
    await db.userSubscription.upsert({
      where: { userId: session.user.id },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
      create: {
        userId: session.user.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      }
    })

    // Revalida a página para atualizar o "SEU PLANO ATUAL" instantaneamente
    revalidatePath("/assinatura")
    
    return { success: true }
  } catch (error) {
    console.error("[SUBSCRIBE_ERROR]", error)
    return { error: "Erro interno ao processar a assinatura" }
  }
}