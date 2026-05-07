"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/slug"

export async function loginAdmin(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return { error: "Credenciais inválidas" }
  }

  const cookieStore = await cookies()
  cookieStore.set("admin_token", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  redirect("/admin/lotes")
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  redirect("/admin/login")
}

// --- CRUD DE MARCAS ---

export async function getAdminBrands() {
  return await db.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { listings: true }
      }
    }
  })
}

export async function createBrand(data: { name: string; logoUrl?: string }) {
  try {
    const slug = slugify(data.name) // Ajuste o import se usar outro nome
    await db.brand.create({
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
      }
    })
    revalidatePath("/admin/marcas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao criar marca:", error)
    return { error: "Erro ao criar marca. Verifique se ela já existe." }
  }
}

export async function toggleBrandStatus(id: string, isActive: boolean) {
  try {
    await db.brand.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath("/admin/marcas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao alterar status da marca:", error)
    return { error: "Falha ao alterar status." }
  }
}

export async function deleteBrand(id: string) {
  try {
    // Nota: Se houver produtos vinculados, o Prisma bloqueará o delete ou setará nulo dependendo da relation
    await db.brand.delete({ where: { id } })
    revalidatePath("/admin/marcas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar marca:", error)
    return { error: "Não é possível deletar uma marca que já possui anúncios vinculados." }
  }
}