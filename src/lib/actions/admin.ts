"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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
