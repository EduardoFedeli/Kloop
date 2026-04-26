import { db } from "@/lib/db"

export type VerifyTokenResult =
  | { status: "success" }
  | { status: "expired" }
  | { status: "invalid" }

export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  })

  if (!record) return { status: "invalid" }

  if (record.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { token } })
    return { status: "expired" }
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationToken.delete({ where: { token } }),
  ])

  return { status: "success" }
}
