"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type FavoriteActionResult = { favorited: boolean } | { error: string }

export async function toggleFavorite(listingId: string): Promise<FavoriteActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "unauthenticated" }

  const existing = await db.favorite.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  })

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } })
    revalidatePath("/favorites")
    return { favorited: false }
  } else {
    await db.favorite.create({ data: { userId: session.user.id, listingId } })
    revalidatePath("/favorites")
    return { favorited: true }
  }
}
