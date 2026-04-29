import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email/send-verification"

const bodySchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "email inválido" }, { status: 422 })
    }

    const { email } = parsed.data

    const user = await db.user.findUnique({ where: { email } })

    // Resposta silenciosa se usuário não existe ou já verificado — não revelar existência de conta
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true })
    }

    const latestToken = await db.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    const SIXTY_SECONDS = 60 * 1000
    if (latestToken && Date.now() - latestToken.createdAt.getTime() < SIXTY_SECONDS) {
      return NextResponse.json(
        { error: "muitas tentativas. aguarde 60 segundos" },
        { status: 429 }
      )
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const token = crypto.randomUUID()

    // Operações de banco atômicas — email fica fora da transação (sem rollback no Resend)
    await db.$transaction([
      db.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
      db.emailVerificationToken.create({
        data: { token, userId: user.id, expiresAt },
      }),
    ])

    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[resend-verification] erro:", error)
    return NextResponse.json(
      { error: "não foi possível reenviar o email. tente novamente" },
      { status: 500 }
    )
  }
}
