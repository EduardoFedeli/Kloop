"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleFollow(targetId: string, targetType: "USER" | "BRAND") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Usuário não autenticado")

  if (targetType === "USER") {
    // Verifica se já segue
    const existing = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetId
        }
      }
    })

    if (existing) {
      await db.follow.delete({ where: { id: existing.id } })
      revalidatePath(`/produto/[slug]`, 'page')
      return { following: false }
    } else {
      await db.follow.create({
        data: { followerId: session.user.id, followingId: targetId }
      })
      revalidatePath(`/produto/[slug]`, 'page')
      return { following: true }
    }
  }

  // BRAND: persiste o follow de marca no banco
  const existing = await db.brandFollow.findUnique({
    where: { userId_brand: { userId: session.user.id, brand: targetId } },
  })

  if (existing) {
    await db.brandFollow.delete({ where: { id: existing.id } })
    revalidatePath('/perfil/marcas')
    return { following: false }
  } else {
    await db.brandFollow.create({
      data: { userId: session.user.id, brand: targetId },
    })
    revalidatePath('/perfil/marcas')
    return { following: true }
  }
}

export async function reportItem(targetId: string, targetType: "LISTING" | "USER", reason: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Usuário não autenticado")

  await db.report.create({
    data: {
      reporterId: session.user.id,
      targetId,
      targetType,
      reason,
      description: "Denúncia feita pela interface LDP",
    }
  })

  return { success: true }
}