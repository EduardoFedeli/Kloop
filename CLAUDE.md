# T-Hex Garage

Marketplace SaaS consolidador de desapegos. Mobile-first, foco no mercado brasileiro de seminovos.

## Stack

- Next.js 14+ (App Router), TypeScript strict, React Server Components por padrão
- PostgreSQL (Neon) via Prisma ORM
- Tailwind CSS com paleta customizada (ver `tailwind.config.ts`)
- Auth.js (NextAuth) para autenticação
- Deploy: Vercel + Neon

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (porta 3000)
npm run build        # build de produção
npm run lint         # ESLint
npx prisma studio    # visualizar banco
npx prisma migrate dev --name <nome>   # criar migration
npx prisma generate  # regenerar client após alterar schema
npx prisma db seed   # popular banco com dados iniciais
```

## Arquitetura

```
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
```

## Paleta de cores

Soft Linen `#F1F1E6` (fundo), Celadon `#A3C9A8` (secundário), Muted Teal `#84B59F` e `#69A297` (botões, destaques), Air Force Blue `#50808E` (títulos, CTAs, preço). Classes Tailwind: `linen`, `celadon`, `teal-muted`, `teal`, `airforce`.

## Prisma

- Schema em `prisma/schema.prisma` com 17 entidades
- MVP cobre: User, Address, SubscriptionPlan, UserSubscription, Category, Listing, ListingImage, Transaction, Review, Favorite, Conversation, ConversationParticipant, Message
- Futuro: Store, StoreBoost, Community, CommunityMember, CommunityRule
- Preços SEMPRE em centavos (int). R$ 50,00 = 5000
- Taxas de comissão como Decimal(5,4). 8% = 0.0800

## Regras importantes

- NUNCA usar `any` no TypeScript. Tipar tudo explicitamente.
- NUNCA colocar `"use client"` em page.tsx — pages são Server Components. Extraia a interatividade para componentes filhos com `"use client"`.
- NUNCA commitar arquivos .env
- SEMPRE usar named exports, nunca default exports (exceto pages e layouts do Next.js)
- SEMPRE usar o utilitário `cn()` de `@/lib/utils` para classes condicionais
- SEMPRE usar `formatPrice()` para exibir preços — nunca formatar manualmente
- Usar Zod para validar inputs de formulários e payloads de API
- Route Handlers (API) em `src/app/api/` retornam `NextResponse.json()`
- Referir-se a `@/lib/db` para acessar o Prisma, nunca instanciar diretamente

## Commits

Commits semânticos obrigatórios: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `docs:`, `test:`. Mensagens em português, descritivas. Exemplo: `feat: implementar feed de produtos com grid e filtros por categoria`.

## Quando compactar

Ao compactar, SEMPRE preservar: lista de arquivos modificados, comandos de teste usados, decisões de arquitetura tomadas na sessão, e o status atual da feature sendo implementada.

## Leitura adicional

- Regras de negócio do domínio: ver `.claude/skills/thex-domain/SKILL.md`
- Padrões de código: ver `.claude/rules/code-style.md`
- Padrões de componentes: ver `.claude/rules/components.md`