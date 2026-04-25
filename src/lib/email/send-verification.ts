import { Resend } from "resend"
import { verifyEmailTemplate } from "./templates/verify-email"

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

  await resend.emails.send({
    // TODO: trocar from após verificar domínio kloop.com.br no Resend
    from: "Kloop <onboarding@resend.dev>",
    to: email,
    subject: "Confirme seu email no Kloop",
    html: verifyEmailTemplate(url),
  })
}
