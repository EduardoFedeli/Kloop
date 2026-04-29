# Auth Verification Design

**Data:** 2026-04-21
**Branch:** feat/melhorias-no-design-ui-ux
**Status:** Aprovado — pronto para implementação

---

## Objetivo

Elevar o fluxo de autenticação do Kloop para estado profissional:
- Validação forte de senha (8+ chars, 1 letra, 1 número)
- Verificação de email obrigatória antes do primeiro login
- Google OAuth funcionando e validado end-to-end
- Mensagens de erro específicas em pt-BR
- TypeScript strict, build limpo

---

## Pré-requisitos de Infra

Antes de fazer deploy, os seguintes itens precisam estar configurados:

| Item | Dev | Produção |
|------|-----|----------|
| `RESEND_API_KEY` | Chave do sandbox Resend | Chave de produção |
| `AUTH_GOOGLE_ID` | Client ID do Google Cloud Console | Idem |
| `AUTH_GOOGLE_SECRET` | Client Secret | Idem |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL pública do Vercel |
| `AUTH_SECRET` | Qualquer string aleatória | Secret seguro |

**Domínio de email (produção):**
O Resend exige que o domínio `kloop.com.br` tenha SPF, DKIM e DMARC configurados no DNS antes de enviar emails em produção. Em dev, usar o domínio sandbox `onboarding@resend.dev` como `from` é suficiente para testar o fluxo.

> **TODO (infra):** Quando o domínio `kloop.com.br` estiver verificado no Resend, trocar o `from` em `src/lib/email/send-verification.ts` de `onboarding@resend.dev` para `noreply@kloop.com.br`. Marcado com `// TODO: trocar from após verificar domínio kloop.com.br no Resend`.

Arquivo `.env.example` deve incluir:
```
RESEND_API_KEY=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=
```

---

## Arquitetura

```
UI (AuthTabs / verify pages)
  ↓ fetch
API Routes (register / verify / resend-verification)
  ↓ prisma
Data Layer (User + EmailVerificationToken)
  ↓ resend SDK
Email (send-verification → template HTML)
  ↑ callback
Auth.js (signIn callback — bloqueia não-verificados via Credentials)
```

---

## Data Model

### Novo modelo: `EmailVerificationToken`

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

No modelo `User`: adicionar relação inversa `emailVerificationTokens EmailVerificationToken[]`.

**O campo `User.emailVerified DateTime?` já existe** no schema — sem alteração.

**Sem campo extra no User para rate limit.** O rate limit de 60s é derivado do `createdAt` do token mais recente do usuário — estado de fluxo de verificação não vaza para o modelo User.

### Migration SQL para dev

Após rodar `prisma migrate dev`, executar para marcar seeds como verificados:

```sql
UPDATE "users" SET "email_verified" = NOW() WHERE "email" LIKE '%@kloop.com.br';
```

> **TODO (ops):** Implementar cleanup de tokens expirados via cron job. A query é:
> `DELETE FROM email_verification_tokens WHERE expires_at < NOW();`
> Pode ser um endpoint `/api/cron/cleanup-tokens` chamado por Vercel Cron ou cron externo.
> Não implementado neste PR — intenção registrada aqui.

---

## Validação (Zod)

**Arquivo:** `src/lib/validators/auth.ts`

```ts
export const registerSchema = z.object({
  name: z.string().min(2, "nome é obrigatório"),
  email: z.string().email("email inválido"),
  password: z
    .string()
    .min(8, "a senha deve ter no mínimo 8 caracteres")
    .regex(/[a-zA-Z]/, "a senha deve ter pelo menos 1 letra")
    .regex(/\d/, "a senha deve ter pelo menos 1 número"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "as senhas não conferem",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email("email inválido"),
  password: z.string().min(1, "informe sua senha"),
})
```

**Regras de senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra (qualquer case)
- Pelo menos 1 número
- Caractere especial NÃO exigido

---

## API Routes

### `POST /api/auth/register`

Reescreve o arquivo existente.

**Fluxo:**
1. Parse com `registerSchema` (Zod)
2. Verifica email duplicado → `"este email já está cadastrado. faça login ou recupere sua senha"` (400)
3. `bcrypt.hash(password, 10)`
4. Cria `User` com `emailVerified: null`
5. Cria `EmailVerificationToken` com `token = crypto.randomUUID()`, `expiresAt = now + 24h`
6. Chama `sendVerificationEmail(user.email, token)`
7. Retorna `{ redirectTo: '/verify-pending', email: user.email }` (201)

**Erros:**
- `400` email duplicado com mensagem específica
- `422` falha de validação Zod
- `500` erro interno genérico

---

### `GET /api/auth/verify?token=`

**Fluxo:**
1. Lê `searchParams.token`
2. `db.emailVerificationToken.findUnique({ where: { token } })`
3. Não encontrado → `{ error: 'invalid' }` (400)
4. `expiresAt < now` → deleta token, retorna `{ error: 'expired' }` (400)
5. Seta `user.emailVerified = new Date()`, deleta token (em uma transaction)
6. Retorna `{ success: true }` (200)

---

### `POST /api/auth/resend-verification`

**Fluxo:**
1. Recebe `{ email }`
2. Busca User — se não encontrado ou `emailVerified != null` → responde 200 silencioso (não revelar existência de conta)
3. Busca token mais recente: `db.emailVerificationToken.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })`
4. Se `token.createdAt > now - 60s` → `"muitas tentativas. aguarde 60 segundos"` (429)
5. **Dentro de `db.$transaction()`:**
   - Deleta todos os tokens anteriores do user
   - Cria novo token com `expiresAt = now + 24h`
6. Fora da transação: chama `sendVerificationEmail(email, novoToken)`
7. Retorna `{ success: true }` (200)

**Atomicidade:** O bloco dentro da transação garante que dois requests simultâneos não criam tokens duplicados nem passam ambos pelo rate limit. O envio do email fica fora pois rollback no Resend não faz sentido.

---

## Email

### Dependência nova

```bash
npm install resend
```

### `src/lib/email/send-verification.ts`

```ts
import { Resend } from 'resend'
import { verifyEmailTemplate } from './templates/verify-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`
  await resend.emails.send({
    // TODO: trocar from após verificar domínio kloop.com.br no Resend
    from: 'Kloop <onboarding@resend.dev>',
    to: email,
    subject: 'Confirme seu email no Kloop',
    html: verifyEmailTemplate(url),
  })
}
```

### `src/lib/email/templates/verify-email.tsx`

HTML simples (sem react-email — menos dependências), paleta Kloop:
- Cor primária: Air Force Blue `#50808E`
- Fundo: Soft Linen `#F1F1E6`
- Botão CTA com link de verificação
- Texto "este link expira em 24 horas"
- Fallback: URL em texto puro abaixo do botão

---

## UI

### Estrutura de páginas

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/login` | `src/app/(auth)/login/page.tsx` | Server Component | Renderiza `<AuthTabs defaultTab="login" />` |
| `/register` | `src/app/(auth)/register/page.tsx` | Server Component | Renderiza `<AuthTabs defaultTab="register" />`, passa `searchParams` |
| `/verify-pending` | `src/app/(auth)/verify-pending/page.tsx` | Server Component | Pós-registro: "verifique seu email" |
| `/verify` | `src/app/(auth)/verify/page.tsx` | Server Component | Lê `?token=`, chama API verify, renderiza resultado |

### `<AuthTabs />` (Client Component)

Localização: `src/components/auth/AuthTabs.tsx`

- React Hook Form + `@hookform/resolvers/zod`
- **Aba "Entrar":**
  - Campos: email + senha
  - Erro `EMAIL_NOT_VERIFIED` → banner com CTA "reenviar email de verificação"
  - Senha vazia → "informe sua senha" (via `loginSchema`)
  - Submit: `signIn('credentials', { email, password, redirect: false })`
- **Aba "Criar conta":**
  - Campos: nome, email, senha, confirmar senha
  - Checklist em tempo real abaixo do campo senha (onChange):
    - ✓ pelo menos 8 caracteres
    - ✓ pelo menos 1 letra
    - ✓ pelo menos 1 número
  - Submit: `POST /api/auth/register`, on success → `/verify-pending?email=...`
- Botão "Entrar com Google" em ambas as abas → `signIn('google')`
- Botão desabilitado enquanto `isSubmitting === true`
- Query param `?redirectTo` preservado ao trocar abas

### `/verify-pending`

- Mostra email via `searchParams.email`
- Botão "reenviar email" → `POST /api/auth/resend-verification` client-side
- Erro de rate limit → mensagem inline "muitas tentativas. aguarde 60 segundos"

### `/verify`

- Server Component, lê `searchParams.token`
- Chama a lógica de verificação diretamente (import de função server-side, não via fetch HTTP — evita chamada circular em SSR)
- **Sucesso:** "email confirmado! agora você pode entrar" + link para `/login`
- **Expirado:** "o link de verificação expirou. clique para receber um novo" + form de reenvio
- **Inválido:** "link inválido ou já utilizado"

---

## Auth.js — `callbacks.signIn`

```ts
async signIn({ user, account }) {
  if (account?.provider === 'google') return true

  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  if (!dbUser?.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED')
  }
  return true
}
```

**Google OAuth — validação end-to-end obrigatória antes do callback:**
1. Testar criação de conta nova via Google → verificar `User.emailVerified` no banco
2. Deslogar e logar de novo via Google → verificar que entra sem bloqueio
3. Se quebrado (redirect URI errado, env vars faltando), corrigir neste PR
4. Documentar no PR description o que foi encontrado

---

## Mensagens de erro (pt-BR, minúsculas)

| Cenário | Mensagem |
|---------|----------|
| Email já cadastrado | "este email já está cadastrado. faça login ou recupere sua senha" |
| Senha vazia no login | "informe sua senha" |
| Email/senha incorretos | "email ou senha incorretos" |
| Email não verificado | "sua conta ainda não foi verificada. verifique seu email ou clique para reenviar" |
| Token expirado | "o link de verificação expirou. clique para receber um novo" |
| Rate limit reenvio | "muitas tentativas. aguarde 60 segundos" |
| Erro Google OAuth | "não foi possível conectar com o google. tente novamente ou use email" |

---

## Critérios de aceite

- [ ] Senha "123456" → erro claro com checklist do que falta
- [ ] Senha "kloop123" → User criado com `emailVerified: null`, email enviado
- [ ] Email chega com link funcional
- [ ] Clicar no link → `/verify` confirma sucesso, redireciona para `/login`
- [ ] Login sem verificar → bloqueado com CTA de reenviar
- [ ] Reenviar → novo email; reenviar < 60s → erro de rate limit
- [ ] Email duplicado → mensagem específica
- [ ] Google OAuth → User com `emailVerified` preenchido, fluxo completo OK
- [ ] Zod em todos os endpoints de auth
- [ ] TypeScript strict, zero `any`, build limpo

---

## Plano de teste manual

1. Criar conta com senha "123" → erro com requisitos
2. Criar conta com senha "kloop123" → redireciona para `/verify-pending`
3. Checar inbox → email chegou com link
4. Clicar no link → `/verify` confirma sucesso
5. Logar → entra normal
6. Criar outra conta, não verificar, tentar logar → bloqueado com CTA
7. Clicar reenviar → novo email chega
8. Clicar reenviar novamente < 60s → erro de rate limit
9. Criar conta via Google → entra direto
10. Deslogar, logar via Google de novo → entra direto

---

## Arquivos NÃO tocados

- Schema de Listing, Favorite, Transaction
- Componentes de feed, PDP, busca
- Qualquer lógica de negócio de produto
