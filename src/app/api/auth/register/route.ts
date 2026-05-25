import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validators/auth"
import { sendVerificationEmail } from "@/lib/email/send-verification"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, email, password, genderPreference } = parsed.data

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "este email já está cadastrado. faça login ou recupere sua senha" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword, genderPreference: genderPreference ?? null },
    })

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const token = crypto.randomUUID()

    await db.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    await sendVerificationEmail(email, token)

    return NextResponse.json(
      { redirectTo: "/verify-pending", email: user.email },
      { status: 201 }
    )
  } catch (error) {
    console.error("[register] erro:", error)
    return NextResponse.json(
      { error: "não foi possível criar sua conta. tente novamente" },
      { status: 500 }
    )
  }
}