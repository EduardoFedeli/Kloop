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
| Kloop (grátis) | R$ 0 | **14%** | 20 | 5 | Não |
| Kloop Pro | R$ 14,99 | **12%** | Ilimitado | 15 | Sim (flag não aplicada em nenhum lugar do código ainda — ver nota abaixo) |

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

### 4. O que ainda NÃO gera receita (existe no schema, não no código de cobrança)

- **Loja Pró (`Store`, `StoreBoost`)** — modelo de dados existe, sem fluxo de criação de
  loja nem cobrança associada. A flag `lojaPersonalizavel: true` no plano Kloop Pro
  sugere que essa era a intenção de diferenciar o plano pago, mas **não existe nenhum
  código que leia essa flag** — é uma promessa no dado que ainda não virou funcionalidade.
- **Comunidades B2B (`Community`)** — não há campo de preço/plano no model `Community`,
  nem cobrança de mensalidade ao condomínio. Hoje é ferramenta 100% interna (criada só
  pelo admin, sem autosserviço) — é feature de aquisição/retenção, não de receita.
- **Kloop Pro / Kloop Shop (consignação)** — o `KloopShopProduct` não tem campo de
  repasse ao usuário original (sem `payoutCents` nem link com `Transaction`). O modelo
  implementado é **a Kloop compra a peça do lote e revende como produto próprio** — não é
  consignação com split, mesmo que o discurso de produto seja "mande sua sacola, cuidamos
  do resto". Vale alinhar isso entre código e discurso comercial antes da apresentação.

## O custo real de cada venda (cashback)

Toda transação concluída gera cashback para os dois lados, constante em `src/lib/cashback.ts`:

| Quem recebe | Taxa real no código (`cashback.ts`) |
|---|---|
| Vendedor (`CREDIT_SELLER`) | **5%** (`SELLER_RATE = 0.05`) |
| Comprador (`CREDIT_BUYER`) | **2%** (`BUYER_RATE = 0.02`) |
| **Total por venda concluída** | **7% do valor** |

> ⚠️ **Vários números diferentes para a mesma regra, encontrados no próprio produto —
> vale unificar antes de citar para a banca:** o comentário do enum
> `CashbackTransactionType` no `schema.prisma` diz "vendedor ganha 3%"; o simulador
> (`/admin/simulador`) assume cashback total de 5% (3%+2%); a tela `/cashback` diz
> literalmente "vendedores ganham 8%/compradores 4% em planos pagos" vs "5%/2% no plano
> básico" — uma diferenciação por plano que **não existe na lógica de crédito real**. A
> implementação real (`cashback.ts`) é a única fonte de verdade: **5% vendedor + 2%
> comprador = 7% do GMV**, sempre igual, independente do plano, expirando em **120 dias**.

O cashback pode ser usado em até **30%** do valor de uma compra futura. Como hoje não
existe gateway de pagamento real, "usar cashback no checkout" só debita o saldo interno do
comprador — não é ainda, de fato, dinheiro saindo do caixa da Kloop.

## Simulações de viabilidade (recalculadas com os planos reais)

Cenário-base: 500 usuários iniciais, crescimento de 8%/mês, **mix 80% grátis / 20% Kloop
Pro**, 1,5 transação/usuário/mês, ticket médio R$150, 15% dos usuários usam cashback,
churn de assinantes 5%/mês, cashback nos 7% reais do código.

**Comissão ponderada com o mix 80/20: 13,6% do GMV** — bem mais alta do que os ~8,4% que a
versão anterior desta doc calculava com o modelo de 3 planos antigo. Isso é uma boa
notícia de viabilidade: a estrutura atual (2 planos, comissão base de 14%) gera mais
receita por venda do que o modelo anterior.

| Cenário | Custos fixos/mês | Taxa de gateway* | Break-even | Lucro acumulado em 3 anos |
|---|---|---|---|---|
| Piso (sem custo fixo, sem gateway) | R$ 0 | 0% | Mês 1 | ~R$ 28.950,00 |
| Realista (infra + operação enxuta) | R$ 15.000 | 3% | **Mês 7** | ~R$ 16.730,00 |
| Conservador (equipe maior, taxas maiores) | R$ 25.000 | 3,5% | **Mês 20** | ~R$ 11.990,00 |

\* *Taxa de gateway de pagamento (Pix/cartão) ainda não existe no código — hoje o
pagamento é mockado — mas é custo obrigatório assim que houver gateway real.*

**Leitura honesta para a banca:** com os planos reais (14%/12%), o modelo é mais robusto
do que a documentação anterior sugeria — mesmo no cenário conservador de custo
operacional, o break-even acontece dentro de 3 anos, e com folga. O ponto de atenção
genuíno não é "a comissão é suficiente", é: (1) a assinatura ainda não tem cobrança real
implementada, então essa fatia de receita (20% do mix assumido) é, por enquanto,
projeção — não caixa; e (2) uma comissão de 14% no plano grátis é alta perto de
concorrentes (Enjoei cobra por volume, geralmente entre 20-30% dependendo da faixa — então
o Kloop está posicionado abaixo disso, o que é bom para conversão, mas vale confirmar que
14% ainda deixa margem depois de gateway + cashback: 14% - 7% cashback - 3% gateway =
**~4% de margem líquida por venda no plano grátis**, antes de custos fixos).

## Recomendações para antes da apresentação

1. **Unificar a taxa de cashback** em todos os lugares onde ela é citada (enum, simulador,
   texto da tela `/cashback`) — hoje há três números diferentes no próprio produto.
2. **Atualizar o simulador administrativo** (`/admin/simulador`) para refletir os 2 planos
   reais (14%/12%) em vez do modelo antigo de 3 planos — hoje ele ainda simula um cenário
   que não existe mais no produto.
3. Ter clareza no discurso sobre **assinatura e impulso extra ainda serem simulados** (sem
   gateway/cobrança real) — evita prometer receita que ainda não está implementada.
4. Ter clareza sobre **Kloop Pro ser hoje compra do lote pela Kloop**, não consignação com
   repasse — evita contradição se a banca perguntar "e o dono da peça, quanto recebe?".
5. Deixar explícito que **Loja Pró e Comunidades B2B ainda não geram receita** — existem
   no roadmap e no schema, mas monetizá-las é trabalho futuro, não um número já em caixa.

Para uma discussão mais profunda sobre se cada uma dessas peças do modelo de negócio vale
a pena manter como está, ver [08 — Revisão de Negócio](08-revisao-negocio.md).
