export function verifyEmailTemplate(verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirme seu email no Kloop</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F1E6;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F1E6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#50808E;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Kloop</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#50808E;font-size:20px;font-weight:700;">Confirme seu email</h2>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Clique no botão abaixo para confirmar seu endereço de email e ativar sua conta no Kloop.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#50808E;">
                    <a href="${verificationUrl}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">
                      Confirmar email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">
                Este link expira em <strong>24 horas</strong>.
              </p>
              <p style="margin:0;color:#6B7280;font-size:13px;">
                Se não conseguir clicar no botão, copie e cole este link no navegador:
              </p>
              <p style="margin:8px 0 0;word-break:break-all;">
                <a href="${verificationUrl}" style="color:#50808E;font-size:12px;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #F1F1E6;background-color:#FAFAF5;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
                Se você não criou uma conta no Kloop, ignore este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
