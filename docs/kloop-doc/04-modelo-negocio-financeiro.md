# 04 — Modelo de Negócio e Financeiro

> Fontes desta seção: `prisma/seed.ts` (o seed **oficial**, rodado por `npx prisma db seed`
> — é a fonte de verdade dos planos), `src/lib/cashback.ts`, `src/lib/actions/subscription.ts`,
> `src/lib/actions/megafone.ts`, `src/components/assinatura/AssinaturaClient.tsx` e o
> simulador financeiro já existente no produto (`/admin/simulador`).
>
> ⚠️ **Nota de revisão:** a primeira versão deste documento usava números de
> `prisma/seed-categories.ts`/`seed-financial.ts` (3 planos, 10%/5%/3%, R$29,90/R$59,90) —
> essas são fixtures secundárias desatualizadas. O `prisma/seed.ts` oficial desativa
> explicitamente o plano intermediário (`isActive: false` no plano de slug `pro`) e hoje só
> tem **2 planos ativos**, com números diferentes dos dois documentos antigos. Esta versão
> usa os números reais. Regra geral daqui pra frente: **o app manda, os comentários e
> fixtures antigas não** — sempre que a documentação e o código divergirem, o código atual
> é a verdade.

## Como o Kloop ganha dinheiro hoje (implementado em código)

### 1. Comissão por venda (marketplace) — fonte de receita principal

Toda venda concluída gera comissão para a Kloop, calculada sobre o valor do produto
(`Transaction.commissionCents = amountCents × commissionRate`). A taxa depende do plano
de assinatura do vendedor. **Só existem 2 planos ativos hoje:**

| Plano | Preço/mês | Comissão sobre venda | Anúncios ativos | Impulsos/semana* | Loja personalizável |
|---|---|---|---|---|---|
| Kloop (grátis) | R$ 0 | **14%** | 75 | 5 | Não |
| Kloop Pro | R$ 14,99 | **12%** | Ilimitado | 20 | Sim (roadmap — ver [05](05-estado-atual-roadmap.md), ainda não implementada no código) |

> **Atualizado em 2026-08:** o limite do plano grátis subiu de 20 para **75 anúncios**, e
> os impulsos do Kloop Pro subiram de 15 para **20/semana** — decisão tomada após a
> revisão de negócio (ver [08](08-revisao-negocio.md)): o limite de 20 batia primeiro no
> usuário casual fazendo desapego de armário, não no "vendedor profissional" que a
> assinatura deveria mirar. Com 75, o limite raramente é a razão de alguém assinar — a
> venda da assinatura passa a ser genuinamente sobre impulsos/velocidade e (no futuro)
> loja personalizável, não sobre desbloquear o básico.

\* *"Impulso" é o novo nome do que era chamado de "megafone" — ver
[02](02-funcionalidades.md) para o histórico do rename.*

Cria um incentivo de conversão, mas mais sutil do que a versão anterior desta doc sugeria:
a diferença de comissão é só **2 pontos percentuais** (14%→12%). Fazendo a conta, um
vendedor só "empata" o custo da assinatura (R$14,99) com a economia de comissão a partir
de **~R$750 em vendas no mês** (a 2pp de economia). Em peças de R$150 em média, isso é
**5 vendas por mês**. Abaixo disso, o vendedor paga a assinatura só pelos outros
benefícios (anúncios ilimitados, mais impulsos, loja personalizável) — não pela economia
de comissão em si. Vale ter essa conta pronta se a banca perguntar "por que alguém
pagaria?".

### 2. Assinatura B2C recorrente — hoje 100% simulada

Receita previsível (MRR), independente de haver venda no mês. **Importante:** a action
`subscribeToPlan` (`src/lib/actions/subscription.ts`) apenas troca o `planId` do usuário
no banco — não há gateway de pagamento integrado, nenhum registro em
`SubscriptionPayment` é criado, e **não existe cancelamento nem downgrade** implementados
(o único caminho é assinar outro plano, que sobrescreve o atual). Ou seja: hoje a
"receita de assinatura" é uma simulação de fluxo, não dinheiro entrando de fato.

### 3. Impulsos (antigo "megafone") — hoje é retenção do plano, não upsell avulso

Cada plano dá uma cota semanal de impulsos (destaque de anúncio por 7 dias, com desconto
obrigatório de preço se o anúncio é antigo — 10% se ≥29 dias, 5% se ≥8 dias, para
incentivar girar estoque parado). Existe um botão "comprar impulsos extras", mas ele
**concede +5 de graça, sem cobrança nenhuma** — não é uma terceira fonte de receita hoje,
é um botão de teste/placeholder.

### 4. Kloop Shop — consignação com repasse escalonado por faixa de preço

*(Atualizado em 2026-08 — antes disso o Kloop Shop era descrito como "a Kloop compra a
peça e revende como produto próprio", sem repasse nenhum. Isso mudou.)*

Quando um lote enviado via Kloop Pro é aprovado e publicado na Kloop Shop, a Kloop faz
todo o trabalho por peça — fotografa, descreve, guarda, embala e envia — o que é diferente
de um anúncio comum onde o próprio vendedor faz esse trabalho. Por isso o repasse ao
consignante (dono original da peça) é **escalonado pelo valor da peça**, não um percentual
fixo — a lógica: peças baratas custam praticamente o mesmo trabalho de fotografar/anunciar
que peças caras, então precisam de mais margem percentual pra Kloop; peças caras já geram
valor absoluto suficiente pra Kloop mesmo com uma fatia menor, então o consignante fica com
mais (é a mesma lógica que consignação de luxo real, tipo RealReal, usa).

| Faixa de preço | Repasse ao consignante | Fatia da Kloop |
|---|---|---|
| Até R$ 79,99 | 45% | 55% |
| R$ 80,00 – R$ 299,99 | 55% | 45% |
| R$ 300,00 ou mais | 65% | 35% |

Implementado em `src/lib/kloopShopPayout.ts` (`getConsignorShareRate`,
`calcConsignorPayout`). O repasse é **calculado e travado no momento em que o admin marca
o produto como vendido** (`markProductSold` em `src/lib/actions/kloopShop.ts`,
`KloopShopProduct.consignorPayoutCents`) — não recalcula depois se o preço mudar. O
consignante vê a estimativa (e o valor travado, quando já vendido) no próprio painel
`/pro/dashboard`; o admin vê o mesmo cálculo em `/admin/kloop-shop`.

**Por que 45/55/65 e não os 50/50 do Enjoei:** o Enjoei também faz o trabalho por peça no
serviço de consignação deles, e 50/50 já é generoso considerando isso. Ir mais generoso que
o Enjoei (ex. 60/40 fixo) sem reduzir o trabalho por peça inverteria a lógica econômica —
quem faz mais trabalho manual deveria ficar com mais, não menos. O escalonamento dá um
diferencial real e defensável ("quanto mais vale sua peça, mais você recebe") só na faixa
onde o valor absoluto sustenta isso, sem comprometer a margem nas peças baratas — que são a
maioria do volume esperado num desapego de guarda-roupa comum.

**Ainda não é dinheiro saindo do caixa de verdade:** não existe checkout público pro Kloop
Shop (`soldAt` só é setado manualmente pelo admin — hoje não há botão de compra pro
consumidor final na vitrine `/kloop-shop`). O mecanismo de cálculo e trava do repasse está
pronto e correto, mas falta: (1) o checkout público da Kloop Shop pra clientes comprarem de
verdade, e (2) o pagamento de fato ao consignante (hoje é só um número registrado no banco,
sem saída de PIX/transferência).

### 5. O que ainda NÃO gera receita (existe no schema, não no código de cobrança)

- **Loja Pró (`Store`, `StoreBoost`)** — modelo de dados existe, sem fluxo de criação de
  loja nem cobrança associada. A flag `lojaPersonalizavel: true` no plano Kloop Pro
  sugere que essa era a intenção de diferenciar o plano pago, mas **não existe nenhum
  código que leia essa flag** ainda — é um compromisso de roadmap assumido oficialmente
  (ver [05](05-estado-atual-roadmap.md)), não uma funcionalidade entregue. Importante não
  demonstrar isso pra banca como se já existisse.
- **Comunidades B2B (`Community`)** — não há campo de preço/plano no model `Community`,
  nem cobrança de mensalidade ao condomínio. Hoje é ferramenta 100% interna (criada só
  pelo admin, sem autosserviço) — é feature de aquisição/retenção, não de receita. **Já
  existe uma decisão de modelo financeiro** (split percentual por transação com o
  condomínio, não mensalidade) — ver [09-comunidades.md](09-comunidades.md) para a análise
  completa, ainda não implementada em código.

## O custo real de cada venda (cashback)

Toda transação concluída gera cashback para os dois lados, constante em `src/lib/cashback.ts`:

| Quem recebe | Taxa real no código (`cashback.ts`) |
|---|---|
| Vendedor (`CREDIT_SELLER`) | **3%** (`SELLER_RATE = 0.03`) |
| Comprador (`CREDIT_BUYER`) | **2%** (`BUYER_RATE = 0.02`) |
| **Total por venda concluída** | **5% do valor** |

> ✅ **Corrigido em 2026-08.** A taxa do vendedor era 5% no código (`SELLER_RATE`),
> divergindo do comentário do enum `CashbackTransactionType` (que já dizia "3%"), do
> `seed-financial.ts` e do simulador administrativo (que já assumiam 5% total) — os três
> lugares "errados" na verdade já estavam certos, era só o código que divergia. Reduzida
> para 3%, alinhando tudo: **3% vendedor + 2% comprador = 5% do GMV**, sempre igual,
> independente do plano, expirando em **120 dias**. A tela `/cashback` também foi
> corrigida — ela mostrava "8%/4% em planos pagos" (uma diferenciação por plano que nunca
> existiu na lógica de crédito real) e agora lê a taxa direto de `cashback.ts`
> (`SELLER_RATE`/`BUYER_RATE` exportadas), então não tem mais como os dois divergirem de
> novo no futuro.

O cashback pode ser usado em até **30%** do valor de uma compra futura. Como hoje não
existe gateway de pagamento real, "usar cashback no checkout" só debita o saldo interno do
comprador — não é ainda, de fato, dinheiro saindo do caixa da Kloop.

## Simulações de viabilidade (recalculadas com os planos reais e o cashback correto)

> ✅ **Corrigido em 2026-08.** Duas descobertas nesta rodada: (1) o crédito de cashback é
> **incondicional em toda venda concluída** — o custo é sobre 100% do GMV, não sobre uma
> fatia de "usuários que usam cashback" como uma versão anterior desta tabela assumia; e
> (2) a taxa do vendedor no código estava em 5% (divergindo do resto do produto, que já
> assumia 3%). O código foi corrigido pra 3% — ver nota acima. As simulações abaixo já
> usam o valor corrigido (5% total = 3% vendedor + 2% comprador, sobre 100% do GMV).

Cenário-base: 500 usuários iniciais, crescimento de 8%/mês, **mix 80% grátis / 20% Kloop
Pro**, 1,5 transação/usuário/mês, ticket médio R$150, churn de assinantes 5%/mês.

**Comissão ponderada com o mix 80/20: 13,6% do GMV.** Com o cashback real (5% de 100% do
GMV), a margem bruta antes de custos fixos é **8,6% do GMV**.

| Cenário | Custos fixos/mês | Taxa de gateway* | Break-even | Lucro acumulado em 3 anos |
|---|---|---|---|---|
| Piso (sem custo fixo, sem gateway) | R$ 0 | 0% | Mês 1 | ~R$ 19.970,00 |
| Realista (infra + operação enxuta) | R$ 15.000 | 3% | **Mês 19** | ~R$ 7.750,00 |
| Conservador (equipe maior, taxas maiores) | R$ 25.000 | 3,5% | **Mês 31** | ~R$ 3.010,00 |

\* *Taxa de gateway de pagamento (Pix/cartão) ainda não existe no código — hoje o
pagamento é mockado — mas é custo obrigatório assim que houver gateway real.*

**Leitura honesta para a banca:** com os planos reais (14%/12%) e o cashback corrigido
(5% incondicional), o modelo é viável nos três cenários — inclusive o conservador, que
antes da correção não atingia break-even em 3 anos. Essa é a versão dos números que vale
usar na apresentação.

## Recomendações para antes da apresentação

1. ✅ **Taxa de cashback unificada e corrigida** — vendedor reduzido de 5% para 3% em
   `src/lib/cashback.ts`, e a tela `/cashback` agora lê a taxa real do código em vez de
   ter um número hardcoded divergente. Não há mais números diferentes pra essa regra no
   produto.
2. **Atualizar o simulador administrativo** (`/admin/simulador`) para não escalar o custo
   de cashback por "% de usuários" — o crédito é incondicional, deveria aplicar sobre
   100% do GMV. O percentual (5%) que ele já assumia estava certo; só a forma de aplicar
   estava errada.
3. Ter clareza no discurso sobre **assinatura e impulso extra ainda serem simulados** (sem
   gateway/cobrança real) — evita prometer receita que ainda não está implementada.
4. Ter na ponta da língua a resposta pra "e o dono da peça, quanto recebe?": **repasse
   escalonado 45%/55%/65% conforme a faixa de preço**, calculado e travado quando o admin
   marca a venda — mas deixar claro que ainda não existe checkout público pro Kloop Shop
   nem pagamento de fato ao consignante, só o cálculo registrado no banco.
5. Deixar explícito que **Loja Pró e Comunidades B2B ainda não geram receita** — existem
   no roadmap e no schema, mas monetizá-las é trabalho futuro, não um número já em caixa.

Para uma discussão mais profunda sobre se cada uma dessas peças do modelo de negócio vale
a pena manter como está, ver [08 — Revisão de Negócio](08-revisao-negocio.md).
