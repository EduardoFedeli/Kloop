# Kloop

Marketplace SaaS consolidador de desapegos focado em sustentabilidade e economia circular. Mobile-first, foco no mercado brasileiro de seminovos.

## Stack
- Next.js 15.5+ (App Router), React 19, TypeScript 5 (strict), React Server Components por padrão
- PostgreSQL hospedado no Neon (serverless) via Prisma ORM 6
- Tailwind CSS v4 (configurado via `globals.css` com `@theme`)
- Auth.js (NextAuth v5 beta) para autenticação
- UI e Interatividade: Lucide React (ícones), Sonner (toasts), Zod 4 (validação)
- Deploy: Vercel (frontend) + Neon (banco)

## Comandos

npm run dev          # servidor de desenvolvimento (porta 3000)
npm run build        # build de produção
npm run lint         # ESLint
npx prisma studio    # visualizar banco
npx prisma migrate dev --name <nome>   # criar migration
npx prisma generate  # regenerar client após alterar schema
npx prisma db seed   # popular banco com dados iniciais


## Arquitetura

src/
├── app/                    # App Router — pages e layouts
│   ├── (auth)/             # grupo de rotas: login, register
│   ├── (main)/             # grupo de rotas: feed, listing, dashboard, etc
│   └── api/                # API routes (Route Handlers)
├── components/
│   ├── ui/                 # componentes reutilizáveis (Button, Input, Card, Modal)
│   ├── layout/             # Header, BottomNav, Sidebar
│   ├── listing/            # ListingCard, ListingGrid, ListingForm
│   └── chat/               # ChatWindow, MessageBubble
├── lib/
│   ├── db.ts               # instância singleton do Prisma
│   ├── auth.ts             # configuração do Auth.js
│   ├── utils.ts            # cn(), formatPrice(), formatDate()
│   └── validators/         # schemas Zod para validação
└── types/                  # tipos TypeScript compartilhados


##Paleta de cores (Tailwind v4 via globals.css)
- Fundo Principal: Linen (var(--color-linen) / #F8FAF8)

- Escala Verde:

- Frosted (#D8F3DC)

- Celadon (#B7E4C7)

- Sage (#95D5B2)

- Mint (#74C69D)

- Teal Muted (#52B788)

-Teal / Airforce (#40916C — CTA principal)

-Emerald (#2D6A4F)

-Pine (#1B4332)

-Forest (#081C15)

-Suporte a Dark Mode configurado via classe .dark no <html>.

## Prisma

- Schema em `prisma/schema.prisma` com 17 entidades
- MVP cobre: User, Address, SubscriptionPlan, UserSubscription, Category, Listing, ListingImage, Transaction, Review, Favorite, Conversation, ConversationParticipant, Message
- Futuro: Store, StoreBoost, Community, CommunityMember, CommunityRule
- Preços SEMPRE em centavos (int). R$ 50,00 = 5000
- Taxas de comissão como Decimal(5,4). 8% = 0.0800

## Regras importantes

- Preços: SEMPRE em centavos (int). R$ 50,00 = 5000.

- Comissões: Salvas como Decimal(5,4). Ex: 8% = 0.0800. O sistema deve calcular/exibir a comissão baseada no plano do vendedor.

- Fluxo de Compra: Foco transacional direto (1 produto por vez). Simulamos o fluxo de ponta a ponta sem gateway real de pagamento.

- Mocks de UI: Carrinho/Sacolinha e Cashback existem APENAS como interface gráfica para teste de conversão. Não crie tabelas ou lógicas de backend para isso.

- Comunicação: Ocorre estritamente via Chat Direto (tabelas Conversation e Message). Não existem seções de "perguntas públicas" nos anúncios.

## Padrões de Código

- TypeScript: NUNCA usar any. Tipagem estrita é obrigatória.

- Componentes: Server Components por padrão. Use "use client" estritamente nas bordas para interatividade (hooks, estados).

- Exportações: SEMPRE usar named exports. Default exports apenas em page.tsx e layout.tsx do Next.js.

- Estilização: Use o utilitário cn() de @/lib/utils para fusão de classes condicionais do Tailwind.

- Formatação: SEMPRE usar a função auxiliar formatPrice() para exibir valores monetários na tela.

- Erros: Tratamento via console.error ou toasts do Sonner. Nada de console.log vazio em produção.

- Segurança: NUNCA commitar arquivos .env.

## Commits

Commits semânticos em português do Brasil, diretos e sem enrolação. Tipos permitidos: feat:, fix:, chore:, refactor:.
Exemplo: feat: implementar mock de interface do carrinho de compras

## Quando compactar

Ao compactar, SEMPRE preservar: lista de arquivos modificados, comandos de teste usados, decisões de arquitetura tomadas na sessão, e o status atual da feature sendo implementada.

## Leitura adicional

- Regras de negócio do domínio: ver `.claude/skills/thex-domain/SKILL.md`
- Padrões de código: ver `.claude/rules/code-style.md`
- Padrões de componentes: ver `.claude/rules/components.md`