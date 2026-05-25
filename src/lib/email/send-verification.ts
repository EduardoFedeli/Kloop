import { Resend } from "resend"
import { verifyEmailTemplate } from "./templates/verify-email"

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

  // Em dev sem domínio verificado no Resend, loga o link para uso direto no terminal
  if (process.env.NODE_ENV === "development") {
    console.log(`\n[DEV] Link de verificação para ${email}:\n${url}\n`)
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    // TODO: trocar from após verificar domínio kloop.com.br no Resend
    from: "Kloop <onboarding@resend.dev>",
    to: email,
    subject: "Confirme seu email no Kloop",
    html: verifyEmailTemplate(url),
  })
}
