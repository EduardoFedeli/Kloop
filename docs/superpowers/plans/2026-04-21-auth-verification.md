# Auth Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar validação forte de senha, verificação de email via Resend, e validar Google OAuth end-to-end no Kloop.

**Architecture:** Novo modelo `EmailVerificationToken` com FK para User armazena tokens UUID com expiração de 24h. A API route `POST /register` cria o token e dispara email via Resend. O callback `signIn` do Auth.js bloqueia login de usuários com `emailVerified: null` (exceto Google). O componente `AuthTabs` substitui a lógica duplicada no `AuthModal` e serve também nas páginas `/login` e `/register`.

**Tech Stack:** Next.js 14 App Router, Auth.js v5, Prisma (Neon PostgreSQL), Zod, React Hook Form, Resend, Vitest, bcryptjs, Tailwind CSS (paleta customizada Kloop)

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `prisma/schema.prisma` | Modificar | Adicionar `EmailVerificationToken` + relação no `User` |
| `src/lib/validators/auth.ts` | Criar | `registerSchema`, `loginSchema` com Zod |
| `src/lib/validators/auth.test.ts` | Criar | Testes unitários dos schemas |
| `src/lib/email/templates/verify-email.ts` | Criar | Template HTML com branding Kloop |
| `src/lib/email/send-verification.ts` | Criar | Função `sendVerificationEmail` via Resend |
| `src/lib/auth/verify-token.ts` | Criar | Lógica server-side de verificação de token |
| `src/app/api/auth/register/route.ts` | Reescrever | POST register com validação forte + envio de email |
| `src/app/api/auth/verify/route.ts` | Criar | GET verify?token= |
| `src/app/api/auth/resend-verification/route.ts` | Criar | POST resend com rate limit + db.$transaction() |
| `src/lib/auth.ts` | Modificar | Adicionar `callbacks.signIn` |
| `src/components/auth/AuthTabs.tsx` | Criar | Client Component com RHF + Zod + checklist de senha |
| `src/components/auth/AuthModal.tsx` | Modificar | Usar `AuthTabs`, remover lógica duplicada |
| `src/app/(auth)/login/page.tsx` | Reescrever | Server Component que renderiza `<AuthTabs defaultTab="login">` |
| `src/app/(auth)/register/page.tsx` | Reescrever | Server Component que renderiza `<AuthTabs defaultTab="register">` |
| `src/app/(auth)/verify-pending/page.tsx` | Criar | Página pós-registro com CTA de reenvio |
| `src/app/(auth)/verify/page.tsx` | Criar | Página de verificação de token |
| `.env.example` | Criar | Documentar variáveis necessárias |

---

## Task 1: Instalar dependências

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Instalar pacotes**

```bash
npm install resend react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Verificar instalação**

```bash
npm ls resend react-hook-form @hookform/resolvers
```

Esperado: versões listadas sem erros.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar resend, react-hook-form e @hookform/resolvers"
```

---

## Task 2: Prisma schema — modelo EmailVerificationToken

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Adicionar modelo e relação no schema**

Em `prisma/schema.prisma`, adicionar após o modelo `VerificationToken` (linha ~510):

```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("email_verification_tokens")
}
```

E no modelo `User`, após a linha `sessions Session[]`, adicionar:

```prisma
  emailVerificationTokens EmailVerificationToken[]
```

- [ ] **Step 2: Rodar migration**

```bash
npx prisma migrate dev --name add-email-verification-token
```

Esperado: migration criada e aplicada sem erros.

- [ ] **Step 3: Marcar usuários do seed como verificados**

```bash
npx prisma db execute --stdin <<'EOF'
UPDATE "users" SET "email_verified" = NOW() WHERE "email" LIKE '%@kloop.com.br';
EOF
```

Esperado: rows updated (os usuários seed do banco).

- [ ] **Step 4: Regenerar client**

```bash
npx prisma generate
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: adicionar modelo EmailVerificationToken ao schema"
```

---

## Task 3: Validators Zod + testes unitários

**Files:**
- Create: `src/lib/validators/auth.ts`
- Create: `src/lib/validators/auth.test.ts`

- [ ] **Step 1: Escrever os testes primeiro**

Criar `src/lib/validators/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { registerSchema, loginSchema } from "./auth"

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@email.com",
      password: "kloop123",
      confirmPassword: "kloop123",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "abc12",
      confirmPassword: "abc12",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.flatten().fieldErrors
    expect(errors?.password).toBeDefined()
  })

  it("rejeita senha sem letra", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "12345678",
      confirmPassword: "12345678",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it("rejeita senha sem número", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it("rejeita quando senhas não conferem", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "kloop123",
      confirmPassword: "kloop456",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined()
  })

  it("rejeita email inválido", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "nao-e-email",
      password: "kloop123",
      confirmPassword: "kloop123",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })
})

describe("loginSchema", () => {
  it("aceita dados válidos", () => {
    const result = loginSchema.safeParse({
      email: "joao@email.com",
      password: "qualquercoisa",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha vazia com mensagem 'informe sua senha'", () => {
    const result = loginSchema.safeParse({
      email: "joao@email.com",
      password: "",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.flatten().fieldErrors
    expect(errors?.password?.[0]).toBe("informe sua senha")
  })
})
```

- [ ] **Step 2: Rodar testes — devem falhar**

```bash
npm test -- src/lib/validators/auth.test.ts
```

Esperado: FAIL — arquivo `auth.ts` não existe.

- [ ] **Step 3: Implementar os validators**

Criar `src/lib/validators/auth.ts`:

```ts
import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2, "nome é obrigatório"),
    email: z.string().email("email inválido"),
    password: z
      .string()
      .min(8, "a senha deve ter no mínimo 8 caracteres")
      .regex(/[a-zA-Z]/, "a senha deve ter pelo menos 1 letra")
      .regex(/\d/, "a senha deve ter pelo menos 1 número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "as senhas não conferem",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("email inválido"),
  password: z.string().min(1, "informe sua senha"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Rodar testes — devem passar**

```bash
npm test -- src/lib/validators/auth.test.ts
```

Esperado: todos os testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validators/auth.ts src/lib/validators/auth.test.ts
git commit -m "feat: adicionar validators Zod de autenticação com testes"
```

---

## Task 4: Template de email + função de envio

**Files:**
- Create: `src/lib/email/templates/verify-email.ts`
- Create: `src/lib/email/send-verification.ts`
- Create: `.env.example`

- [ ] **Step 1: Criar template HTML**

Criar `src/lib/email/templates/verify-email.ts`:

```ts
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
```

- [ ] **Step 2: Criar função de envio**

Criar `src/lib/email/send-verification.ts`:

```ts
import { Resend } from "resend"
import { verifyEmailTemplate } from "./templates/verify-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

  await resend.emails.send({
    // TODO: trocar from após verificar domínio kloop.com.br no Resend
    from: "Kloop <onboarding@resend.dev>",
    to: email,
    subject: "Confirme seu email no Kloop",
    html: verifyEmailTemplate(url),
  })
}
```

- [ ] **Step 3: Criar .env.example**

Criar `.env.example` na raiz do projeto:

```
# Banco de dados (Neon PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# Auth.js
AUTH_SECRET=

# Google OAuth (Google Cloud Console)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# URL base da aplicação
NEXTAUTH_URL=http://localhost:3000

# Resend (resend.com — free tier 3k emails/mês)
# Em dev: usar chave do sandbox
# Em produção: verificar domínio kloop.com.br no Resend (SPF/DKIM/DMARC)
RESEND_API_KEY=
```

- [ ] **Step 4: Adicionar RESEND_API_KEY ao .env local**

No arquivo `.env` (não commitado), adicionar:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
NEXTAUTH_URL=http://localhost:3000
```

Obter a chave em https://resend.com/api-keys (conta gratuita).

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/ .env.example
git commit -m "feat: adicionar template de email e função sendVerificationEmail"
```

---

## Task 5: Reescrever POST /api/auth/register

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Reescrever o route handler**

Substituir completamente `src/app/api/auth/register/route.ts`:

```ts
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

    const { name, email, password } = parsed.data

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "este email já está cadastrado. faça login ou recupere sua senha" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
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
```

- [ ] **Step 2: Verificar build sem erros**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "feat: reescrever registro com validação forte de senha e envio de email"
```

---

## Task 6: Lógica de verificação de token + GET /api/auth/verify

**Files:**
- Create: `src/lib/auth/verify-token.ts`
- Create: `src/app/api/auth/verify/route.ts`

- [ ] **Step 1: Criar a lógica server-side reutilizável**

Criar `src/lib/auth/verify-token.ts`:

```ts
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
```

- [ ] **Step 2: Criar o route handler GET /api/auth/verify**

Criar `src/app/api/auth/verify/route.ts`:

```ts
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/verify-token"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const result = await verifyToken(token)

  if (result.status === "invalid") {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  if (result.status === "expired") {
    return NextResponse.json({ error: "expired" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth/verify-token.ts src/app/api/auth/verify/route.ts
git commit -m "feat: adicionar lógica de verificação de token e rota GET /api/auth/verify"
```

---

## Task 7: POST /api/auth/resend-verification

**Files:**
- Create: `src/app/api/auth/resend-verification/route.ts`

- [ ] **Step 1: Criar o route handler**

Criar `src/app/api/auth/resend-verification/route.ts`:

```ts
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
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/resend-verification/route.ts
git commit -m "feat: adicionar rota POST /api/auth/resend-verification com rate limit"
```

---

## Task 8: Auth.js — callback signIn

**Files:**
- Modify: `src/lib/auth.ts`

A configuração atual usa `session: { strategy: "jwt" }` com Google + Credentials. O `callbacks.signIn` diferencia os erros:
- `authorize` retorna null → `res.error = "CredentialsSignin"` (senha errada)
- `callbacks.signIn` retorna false → `res.error = "AccessDenied"` (email não verificado)

- [ ] **Step 1: Adicionar callback signIn**

Substituir `src/lib/auth.ts` inteiro:

```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordsMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google: emailVerified chega preenchido pelo PrismaAdapter — deixar passar
      if (account?.provider === "google") return true

      // Credentials: bloquear se email não verificado
      // Retornar false → res.error = "AccessDenied" no client (distinguível de "CredentialsSignin")
      if (account?.provider === "credentials") {
        const dbUser = await db.user.findUnique({ where: { id: user.id } })
        if (!dbUser?.emailVerified) return false
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
})
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: adicionar callback signIn para bloquear email não verificado"
```

---

## Task 9: Componente AuthTabs

**Files:**
- Create: `src/components/auth/AuthTabs.tsx`

O componente funciona em dois contextos:
- **Página** (`/login`, `/register`): redireciona via `router.push` no login bem-sucedido
- **Modal** (`AuthModal`): chama `onLoginSuccess()` ao invés de redirecionar

Após registro bem-sucedido (ambos contextos): sempre redireciona para `/verify-pending?email=...`.

- [ ] **Step 1: Criar o componente**

Criar `src/components/auth/AuthTabs.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validators/auth"

interface AuthTabsProps {
  defaultTab?: "login" | "register"
  onLoginSuccess?: () => void
}

function PasswordChecklist({ password }: { password: string }) {
  const checks = [
    { label: "pelo menos 8 caracteres", valid: password.length >= 8 },
    { label: "pelo menos 1 letra", valid: /[a-zA-Z]/.test(password) },
    { label: "pelo menos 1 número", valid: /\d/.test(password) },
  ]

  if (!password) return null

  return (
    <ul className="mt-1.5 flex flex-col gap-0.5">
      {checks.map((check) => (
        <li
          key={check.label}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            check.valid ? "text-teal" : "text-gray-400"
          )}
        >
          <span>{check.valid ? "✓" : "○"}</span>
          {check.label}
        </li>
      ))}
    </ul>
  )
}

function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<"credentials" | "not_verified" | null>(null)
  const [resendEmail, setResendEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    setResendEmail(data.email)

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (!res?.error) {
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        const redirectTo = searchParams.get("redirectTo") || "/"
        router.push(redirectTo)
      }
      return
    }

    if (res.error === "AccessDenied") {
      setServerError("not_verified")
    } else {
      setServerError("credentials")
    }
  }

  async function handleResend() {
    if (!resendEmail) return
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError === "not_verified" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <p className="font-medium">
            sua conta ainda não foi verificada. verifique seu email ou clique para reenviar.
          </p>
          <button
            type="button"
            onClick={handleResend}
            className="mt-1 text-xs font-bold text-amber-700 underline hover:no-underline"
          >
            reenviar email de verificação
          </button>
        </div>
      )}

      {serverError === "credentials" && (
        <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm font-medium text-red-500">
          email ou senha incorretos
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-airforce">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.email
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-semibold text-airforce">
            Senha
          </label>
          <button type="button" className="text-xs font-medium text-teal hover:underline">
            Esqueci a senha
          </button>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="Sua senha"
          {...register("password")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.password
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch("password") ?? ""

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error ?? "não foi possível criar sua conta")
      return
    }

    const redirectTo = searchParams.get("redirectTo")
    const verifyPendingUrl = `/verify-pending?email=${encodeURIComponent(data.email)}${
      redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
    }`
    router.push(verifyPendingUrl)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm font-medium text-red-500">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-sm font-semibold text-airforce">
          Nome completo
        </label>
        <input
          id="reg-name"
          type="text"
          placeholder="Ex: João da Silva"
          {...register("name")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.name
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-semibold text-airforce">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.email
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-semibold text-airforce">
          Senha
        </label>
        <input
          id="reg-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.password
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        <PasswordChecklist password={passwordValue} />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm" className="text-sm font-semibold text-airforce">
          Confirmar senha
        </label>
        <input
          id="reg-confirm"
          type="password"
          placeholder="Repita sua senha"
          {...register("confirmPassword")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.confirmPassword
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
      >
        {isSubmitting ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}

export function AuthTabs({ defaultTab = "login", onLoginSuccess }: AuthTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const isModal = !!onLoginSuccess

  function switchTab(newTab: "login" | "register") {
    setTab(newTab)
    // No modal context, don't touch the URL — the modal overlays the current page
    if (isModal) return
    const redirectTo = searchParams.get("redirectTo")
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
    router.replace(
      newTab === "login" ? `/login${params}` : `/register${params}`,
      { scroll: false }
    )
  }

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-gray-100">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={cn(
            "pb-2 text-sm font-bold transition-colors",
            tab === "login"
              ? "border-b-2 border-teal text-teal"
              : "text-gray-400 hover:text-airforce"
          )}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={cn(
            "pb-2 text-sm font-bold transition-colors",
            tab === "register"
              ? "border-b-2 border-teal text-teal"
              : "text-gray-400 hover:text-airforce"
          )}
        >
          Criar conta
        </button>
      </div>

      {tab === "login" ? (
        <LoginForm onLoginSuccess={onLoginSuccess} />
      ) : (
        <RegisterForm />
      )}

      <div className="my-6 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google")}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-bold text-airforce transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Entrar com Google
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/AuthTabs.tsx
git commit -m "feat: criar AuthTabs com React Hook Form, checklist de senha e tratamento de email não verificado"
```

---

## Task 10: Atualizar AuthModal para usar AuthTabs

**Files:**
- Modify: `src/components/auth/AuthModal.tsx`

- [ ] **Step 1: Simplificar o AuthModal**

Substituir completamente `src/components/auth/AuthModal.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { AuthTabs } from "@/components/auth/AuthTabs"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  function handleLoginSuccess() {
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          aria-label="Fechar modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-airforce"
        >
          <X className="h-5 w-5" />
        </button>

        <AuthTabs defaultTab="login" onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/AuthModal.tsx
git commit -m "refactor: simplificar AuthModal para usar AuthTabs"
```

---

## Task 11: Implementar páginas /login e /register

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Implementar /login**

Substituir `src/app/(auth)/login/page.tsx`:

```tsx
import { AuthTabs } from "@/components/auth/AuthTabs"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <AuthTabs defaultTab="login" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implementar /register**

Substituir `src/app/(auth)/register/page.tsx`:

```tsx
import { AuthTabs } from "@/components/auth/AuthTabs"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <AuthTabs defaultTab="register" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/register/page.tsx
git commit -m "feat: implementar páginas /login e /register com AuthTabs"
```

---

## Task 12: Página /verify-pending

**Files:**
- Create: `src/app/(auth)/verify-pending/page.tsx`

- [ ] **Step 1: Criar a página**

Criar `src/app/(auth)/verify-pending/page.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function VerifyPendingPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "rate_limited" | "error">("idle")

  async function handleResend() {
    if (!email) return
    setStatus("loading")

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (res.status === 429) {
      setStatus("rate_limited")
      return
    }

    if (!res.ok) {
      setStatus("error")
      return
    }

    setStatus("sent")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">✉️</div>
        <h1 className="mb-2 text-xl font-bold text-airforce">Verifique seu email</h1>
        <p className="mb-1 text-sm text-gray-500">Enviamos um link de confirmação para:</p>
        {email && <p className="mb-6 font-semibold text-airforce">{email}</p>}
        <p className="mb-8 text-sm text-gray-500">
          Clique no link do email para ativar sua conta. O link expira em 24 horas.
        </p>

        {status === "sent" && (
          <div className="mb-4 rounded-md bg-teal/10 border border-teal/20 p-3 text-sm font-medium text-teal">
            novo email enviado! verifique sua caixa de entrada.
          </div>
        )}
        {status === "rate_limited" && (
          <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            muitas tentativas. aguarde 60 segundos.
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-500">
            não foi possível reenviar o email. tente novamente.
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={status === "loading" || status === "sent"}
          className="w-full rounded-lg border border-teal p-3 text-sm font-bold text-teal transition-colors hover:bg-teal/5 disabled:opacity-50"
        >
          {status === "loading" ? "Enviando..." : "Reenviar email de verificação"}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Já verificou?{" "}
          <Link href="/login" className="font-medium text-teal hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/verify-pending/page.tsx
git commit -m "feat: criar página /verify-pending com CTA de reenvio"
```

---

## Task 13: Página /verify

**Files:**
- Create: `src/app/(auth)/verify/page.tsx`

Server Component que importa `verifyToken` diretamente — sem fetch HTTP para evitar chamada circular em SSR.

- [ ] **Step 1: Criar a página**

Criar `src/app/(auth)/verify/page.tsx`:

```tsx
import Link from "next/link"
import { verifyToken } from "@/lib/auth/verify-token"

interface VerifyPageProps {
  searchParams: { token?: string }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const token = searchParams.token

  if (!token) {
    return <VerifyResult status="invalid" />
  }

  const result = await verifyToken(token)
  return <VerifyResult status={result.status} />
}

function VerifyResult({ status }: { status: "success" | "expired" | "invalid" }) {
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-xl font-bold text-airforce">Email confirmado!</h1>
          <p className="mb-8 text-sm text-gray-500">
            Sua conta está ativa. agora você pode entrar no Kloop.
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90"
          >
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  if (status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">⏰</div>
          <h1 className="mb-2 text-xl font-bold text-airforce">Link expirado</h1>
          <p className="mb-8 text-sm text-gray-500">
            o link de verificação expirou. clique para receber um novo.
          </p>
          <Link
            href="/verify-pending"
            className="inline-block w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90"
          >
            Receber novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h1 className="mb-2 text-xl font-bold text-airforce">Link inválido</h1>
        <p className="mb-8 text-sm text-gray-500">link inválido ou já utilizado.</p>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg border border-teal p-3 text-sm font-bold text-teal transition-colors hover:bg-teal/5"
        >
          Voltar para login
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rodar build completo**

```bash
npm run build
```

Esperado: build bem-sucedido sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/verify/page.tsx
git commit -m "feat: criar página /verify com renderização server-side do resultado"
```

---

## Task 14: Testar Google OAuth end-to-end

**Files:** nenhum (teste manual — resultado deve ser documentado no PR)

- [ ] **Step 1: Verificar variáveis de ambiente**

Checar que `.env` local contém:
```
AUTH_GOOGLE_ID=<client_id_do_google_cloud_console>
AUTH_GOOGLE_SECRET=<client_secret>
```

Se não configurado: acessar Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID. Adicionar redirect URI: `http://localhost:3000/api/auth/callback/google`.

- [ ] **Step 2: Testar criação de conta via Google**

1. Subir o servidor: `npm run dev`
2. Ir para `http://localhost:3000/login`
3. Clicar "Entrar com Google" e autenticar
4. Verificar no banco se User foi criado com `emailVerified` preenchido:

```bash
npx prisma studio
```

Abrir tabela `users`, confirmar que o novo User tem `email_verified != null`.

- [ ] **Step 3: Testar re-login via Google**

1. Deslogar
2. Clicar "Entrar com Google" novamente
3. Confirmar que entra sem bloqueio (sem banner "AccessDenied")

- [ ] **Step 4: Documentar resultado no PR**

Registrar uma das situações:
- ✅ Google OAuth funcionou — PrismaAdapter preencheu `emailVerified` automaticamente
- ⚠️ Google OAuth quebrado — descrever erro e correção aplicada

Erros comuns e correções:
- `redirect_uri_mismatch`: adicionar `http://localhost:3000/api/auth/callback/google` no Google Cloud Console
- `invalid_client`: verificar `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` no `.env`
- `OAuthAccountNotLinked`: comportamento esperado quando o mesmo email já existe via credentials — não corrigir neste PR

---

## Task 15: Teste manual do fluxo completo + build final

- [ ] **Step 1: Executar roteiro de testes**

| # | Ação | Esperado |
|---|------|----------|
| 1 | `/register`, senha "123" | Checklist mostra o que falta, submit bloqueado |
| 2 | `/register`, senha "kloop123" | Redireciona para `/verify-pending` |
| 3 | Checar inbox | Email chegou com link |
| 4 | Clicar no link | `/verify` mostra "Email confirmado!" |
| 5 | `/login`, logar com conta verificada | Entra com sucesso |
| 6 | Nova conta não verificada, tentar logar | Banner âmbar com CTA reenviar |
| 7 | Clicar "reenviar email" | Novo email chega |
| 8 | Reenviar novamente em < 60s | "muitas tentativas. aguarde 60 segundos" |
| 9 | Cadastrar com email já existente | "este email já está cadastrado. faça login ou recupere sua senha" |
| 10 | Login com senha vazia | "informe sua senha" (inline, não genérico) |

- [ ] **Step 2: Rodar testes unitários**

```bash
npm test
```

Esperado: todos PASS.

- [ ] **Step 3: Build final**

```bash
npm run build
```

Esperado: build bem-sucedido.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore: build e testes passando — fluxo de verificação de email completo"
```

---

## Critérios de aceite (checklist final)

- [ ] Senha "123456" → erro claro com checklist do que falta
- [ ] Senha "kloop123" → User criado com `emailVerified: null`, email enviado
- [ ] Email chega com link funcional
- [ ] Clicar no link → `/verify` confirma sucesso
- [ ] Login sem verificar → bloqueado com CTA de reenviar
- [ ] Reenviar → novo email; reenviar < 60s → erro de rate limit
- [ ] Email duplicado → mensagem específica
- [ ] Google OAuth → User com `emailVerified` preenchido, fluxo completo OK
- [ ] Zod em todos os endpoints de auth
- [ ] TypeScript strict, zero `any`, build limpo
