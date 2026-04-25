import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function requireAddress(currentPath: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const count = await db.address.count({ where: { userId: session.user.id } })
  if (count === 0) {
    redirect(`/completar-perfil?redirectTo=${encodeURIComponent(currentPath)}`)
  }
}
