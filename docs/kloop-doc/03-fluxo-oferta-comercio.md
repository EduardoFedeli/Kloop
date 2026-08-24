# 03 — Fluxo de Oferta e Comércio

> Fonte: `src/app/actions/offers.ts`, `src/lib/offers.ts`, `src/app/api/transactions/**`,
> `src/lib/transaction-rules.ts`, `src/lib/cashback.ts`, `src/app/api/bundle-offers/route.ts`,
> `src/app/api/reviews/route.ts`. Este é o fluxo mais importante do produto — é onde o
> Kloop realmente cobra comissão.

## Visão geral do funil

```
Anúncio ativo
   │
   ├─► Compra direta (preço cheio)  ──┐
   │                                    │
   └─► Oferta (negociação de preço) ──┤
          │  aceita                    │
          ▼                            ▼
                    Transaction (PENDING)
                            │
                    Checkout mockado → PAID
                            │
                    Vendedor despacha → SHIPPED
                            │
                    Comprador confirma recebimento → DELIVERED
                            │
                    Comprador confirma conclusão → COMPLETED
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        Cashback creditado      Review liberado
     (5% vendedor + 2% comprador)   (só o comprador avalia)
```

## 1. Duas formas de iniciar uma compra

**Compra direta** — botão "eu quero! 💚" no anúncio. Cria a `Transaction` já em
`PENDING`, sem passar por negociação. Exige que o comprador tenha endereço padrão
cadastrado e recalcula frete/comissão no momento da criação.

**Oferta (negociação)** — o comprador propõe um valor abaixo do preço anunciado. É o
diferencial competitivo do Kloop frente a marketplaces de preço fixo:

1. Comprador propõe um preço (`priceCents ≤ listing.priceCents`). Kloop cria uma `Offer`
   com `status: PENDING_SELLER`, `currentTurnUserId` = vendedor, `expiresAt` = agora + 24h,
   `roundsCount = 1`, e o primeiro `OfferRound`.
2. **Smart Price (auto-aceite):** se o vendedor ativou `smartPriceEnabled` no anúncio e
   definiu uma faixa de preço aceitável (`idealPriceMinCents`), uma oferta dentro dessa
   faixa é **aceita automaticamente** — cria a `Transaction` e marca a `Offer` como
   `ACCEPTED` na hora, sem o vendedor precisar agir. É a única forma de "resposta
   instantânea" que existe hoje.
3. Sem Smart Price, o vendedor tem três ações possíveis enquanto está com o turno
   (`currentTurnUserId`):
   - **Aceitar** — cria a `Transaction` (`PENDING`) e vincula à oferta.
   - **Recusar** — `Offer` vai para `REJECTED`, fim da negociação.
   - **Contra-propor** — só permitido até **4 rodadas no total** (`MAX_ROUNDS = 4`). Cada
     lance precisa ser coerente com quem propõe (vendedor só sobe o valor, comprador só
     desce), nunca acima do preço anunciado. A cada rodada, o turno inverte
     (`currentTurnUserId`) e o prazo de 24h reinicia.
4. **Expiração é "preguiçosa" (lazy), não um job em background.** Não existe cron
   rodando — a oferta só é marcada `EXPIRED` quando alguém abre a página da oferta ou
   tenta agir sobre ela depois do prazo vencido. Isso é aceitável para uma demo de TCC,
   mas é uma limitação técnica real (uma oferta vencida "parece" ativa até alguém tocar
   nela).
5. **Cancelamento em cascata.** Um mesmo anúncio pode ter várias ofertas simultâneas de
   compradores diferentes. No instante em que uma delas é aceita (ou uma compra direta é
   feita), **todas as outras ofertas ativas daquele anúncio são canceladas
   automaticamente** (`status: CANCELLED`) — o enum documenta isso como "outra venda do
   mesmo Listing concretizou". Evita vender o mesmo item duas vezes.

## 2. A "sacola"/oferta em lote — status real: mock de UI

O carrinho (`/sacola`) permite juntar vários anúncios do mesmo vendedor e mandar uma
oferta única para o lote inteiro. **O model `BundleOffer` existe no banco (com migration
própria), mas a rota `POST /api/bundle-offers` nunca grava nele** — o próprio código tem
o comentário `// MOCK DE MVP: Sacola é apenas teste de conversão. Não registramos
BundleOffer no DB real.` e retorna um ID falso (`mock-bundle-{timestamp}`) só para a UI
seguir o fluxo visualmente. Isso está alinhado com a regra do projeto de que
carrinho/sacola são só interface para teste de conversão — mas é importante que o time
saiba que **isso não é uma feature "quase pronta", é uma tela desenhada para não
persistir nada**, caso a banca pergunte como a negociação em lote funciona de verdade.

## 3. Máquina de estados da transação

`src/lib/transaction-rules.ts` define exatamente estas transições válidas, cada uma
disparada por uma ação de uma das partes:

| De | Para | Quem aciona | Onde |
|---|---|---|---|
| `PENDING` | `PAID` | Comprador (checkout) | `POST /api/transactions/[id]/pay` |
| `PENDING` | `CANCELLED` | Comprador | `POST /api/transactions/[id]/cancel` |
| `PAID` | `SHIPPED` | Vendedor (informa envio) | `POST /api/transactions/[id]/ship` |
| `PAID` | `CANCELLED` | Vendedor | `POST /api/transactions/[id]/cancel` |
| `SHIPPED` | `DELIVERED` | Comprador (confirma recebimento) | `POST /api/transactions/[id]/deliver` |
| `DELIVERED` | `COMPLETED` | Comprador (confirma conclusão) | `POST /api/transactions/[id]/complete` |

`AWAITING_PAYMENT`, `REFUNDED` e `DISPUTED` existem no enum do schema, mas **nenhuma rota
de API leva a transação para esses estados hoje** — são estados modelados para o futuro
(disputa/mediação, reembolso via gateway real), não alcançáveis na versão atual.

## 4. Pagamento — hoje 100% simulado

Não existe gateway real. `POST /pay` apenas marca o anúncio como `SOLD`, debita o
cashback opcionalmente usado (até 30% do valor) e muda o status para `PAID`. O componente
`CheckoutForm.tsx` chama esse endpoint diretamente — não há tela de cartão, Pix ou boleto
de verdade, mesmo que o enum `PaymentMethod` liste PIX/CREDIT_CARD/DEBIT_CARD/BOLETO/PLATFORM_CREDIT.
Isso é intencional para o MVP ("simulamos o fluxo de ponta a ponta sem gateway real de
pagamento", conforme a regra de negócio do projeto).

## 5. Cashback ao longo do fluxo

| Momento | O que acontece |
|---|---|
| Checkout (`pay`) | Se o comprador optou por usar saldo, debita até 30% do valor (`DEBIT_PURCHASE`) |
| Conclusão (`complete`) | Credita 5% do valor ao vendedor e 2% ao comprador (`CREDIT_SELLER`/`CREDIT_BUYER`), expira em 120 dias |
| Cancelamento antes de concluir, com cashback usado | Estorna o débito (`REFUND_CANCELLATION`) |
| Cancelamento depois de já concluído | Reverte os créditos gerados (`REVERSAL`, idempotente) |

## 6. Avaliação (review)

Só o **comprador** pode avaliar, e só depois que a transação chega a `COMPLETED`
(`POST /api/reviews`). Detalhe de implementação relevante: o model `Review` não tem uma
coluna estruturada para tags — as tags escolhidas na UI são concatenadas dentro do próprio
campo `comment` como prefixo (`[tag1, tag2] - comentário`). Funciona para a demo, mas não é
uma feature de tags "de verdade" a nível de banco.

## Onde cada lado do fluxo aparece na UI

- **Comprador:** `/compras` (lista por status), `/compras/[id]` (detalhe/timeline),
  `/compras/ofertas` (negociações em andamento), `/checkout/[transactionId]`.
- **Vendedor:** `/vendas` (hub geral), `/vendas/pendentes` (vendas em andamento),
  `/vendas/ofertas` (negociações recebidas), `/vendas/avaliacoes` (reviews recebidas).
- **Ambos:** `/ofertas/[id]` (tela de negociação com histórico de rodadas e contador de
  prazo).
