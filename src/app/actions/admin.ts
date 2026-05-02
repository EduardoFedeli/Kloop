"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateReportStatus(reportId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  // Validação de segurança pesada: garante que só admins mexem nisto
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    throw new Error("Acesso negado")
  }

  await db.report.update({
    where: { id: reportId },
    data: { status }
  })

  // Atualiza a interface instantaneamente
  revalidatePath("/admin/reports")
  return { success: true }
}