# 08 — Revisão de Negócio (para discussão)

> Esta seção é diferente das anteriores: não descreve o que existe, **questiona** o que
> existe, com chapéu de "técnico em empreendedorismo" olhando pra decisões de produto sob
> a ótica de negócio (não de código). Nada aqui é uma decisão tomada — é munição para a
> conversa entre vocês sobre o que manter, simplificar ou adiar. Onde eu tenho uma opinião
> forte, digo; onde é mais uma pergunta em aberto, também digo.

## 1. A assinatura vale o esforço que ela custa?

> ✅ **Decidido em 2026-08:** mantivemos a assinatura, mas desacoplada do limite de
> anúncios (ver item 2) — passou a vender por impulsos/velocidade e loja personalizável
> (roadmap), não pela economia de comissão. O cálculo abaixo (2pp de economia, ~5
> vendas/mês pra compensar) continua valendo como contexto de por que a comissão sozinha
> não é um bom motivo de venda.


**O que ela dá hoje:** de 14% para 12% de comissão (só 2 pontos percentuais), mais
anúncios ilimitados (vs. 20), mais impulsos (15 vs. 5), por R$14,99/mês.

**O ponto crítico:** a economia real de comissão só compensa a partir de ~5 vendas/mês
(ver [04](04-modelo-negocio-financeiro.md)). Abaixo disso, ninguém assina pela comissão —
assina (se assinar) pelo limite de anúncios e pelos impulsos. Isso significa que **o
verdadeiro motor de conversão da assinatura não é o desconto de comissão, é o limite
artificial de 20 anúncios no plano grátis** (ver item 2). A assinatura, do jeito que está
modelada, é menos "aqui está um valor extra que você quer pagar" e mais "aqui está uma
parede que você paga pra não bater".

**Por que isso pode ser um tiro no pé:** marketplaces C2C que ainda estão provando o
próprio produto (esse é o estágio do Kloop) vivem e morrem pela **liquidez do lado da
oferta** — quanto mais gente anunciando, mais escolha pro comprador, mais motivo pro
comprador voltar. Cobrar (ou limitar) o lado que você mais precisa incentivar nessa fase é
arriscado. Também: assinatura recorrente traz complexidade real de produto que ainda não
existe (cobrança de verdade, cancelamento, downgrade, inadimplência) — é trabalho de
engenharia não-trivial para um retorno que, pelos números, é modesto no cenário atual (a
maior parte da receita simulada continua vindo da comissão, não da assinatura).

**Alternativas para a conversa:**
- Comissão única mais baixa pra todo mundo (ex: 12-13%), sem assinatura — mais simples de
  explicar, sem custo de engenharia de billing, sem fricção pro lado da oferta.
- Manter a assinatura, mas parar de vender ela pela "economia de comissão" (que é fraca) e
  vender pelos benefícios de verdade: anúncios ilimitados, mais impulsos, loja
  personalizável (quando existir).
- Tratar assinatura como uma feature de fase 2 — validar a liquidez do marketplace sem
  ela primeiro, adicionar depois que houver volume de vendedores recorrentes.

## 2. O limite de 20 anúncios no plano grátis é uma boa ideia?

> ✅ **Decidido em 2026-08:** o limite subiu de 20 para **75 anúncios** no plano grátis
> (Kloop Pro passou a vender por impulsos/velocidade + loja personalizável no roadmap, não
> mais pela economia de comissão nem por "desbloquear" anúncios). O raciocínio abaixo fica
> registrado como histórico de por que a mudança foi feita.


**A pergunta que importa:** quem é o usuário que mais provavelmente bate nesse limite? Se
for o "vendedor profissional" que já teria motivo de sobra pra assinar mesmo sem o limite
(mais impulsos, loja), o limite é só um empurrão a mais — ok. Mas se for o **usuário
casual fazendo desapego de armário** (a persona que a proposta de valor do Kloop declara
como alvo primário, ver [01](01-visao-geral-negocio.md)) — alguém organizando uma mudança,
uma limpeza de guarda-roupa, um "brechó de uma vez só" — 20 itens **ativos
simultaneamente** pode ser pouco: se as peças não vendem rápido, elas ficam acumuladas
como "ativas" e o limite bate justamente na pessoa que você mais quer que tenha uma
primeira experiência boa e sem atrito.

**Risco concreto:** um usuário novo que tenta anunciar o guarda-roupa inteiro, bate no
limite de 20, e a única saída oferecida é "pague R$14,99/mês" — isso pode ler como
antipático logo na primeira experiência, especialmente antes da pessoa ter vendido
qualquer coisa e validado que a plataforma funciona pra ela. É o tipo de fricção que
derruba ativação em vez de converter assinatura.

**Para a conversa:** vale simular (literalmente no `/admin/simulador`, se ele for
atualizado) o que muda no modelo se o limite subir bastante (40-50) ou sumir, e a
assinatura passar a vender só por impulsos/velocidade, não por "desbloquear o básico".

## 3. Kloop Pro (consignação) — vale o custo operacional na fase atual?

> ✅ **Decidido em 2026-08:** o modelo de repasse mudou de "Kloop compra a peça" pra
> **consignação de verdade com split escalonado** (45% até R$79,99 / 55% de R$80 a
> R$299,99 / 65% acima de R$300, ver [04](04-modelo-negocio-financeiro.md)). Isso já
> resolve a parte mais preocupante do risco descrito abaixo — a Kloop não assume mais
> capital de giro nem risco de estoque comprando a peça adiantado. O que continua em
> aberto é só a pergunta operacional: vale rodar essa vertical em paralelo com o
> marketplace principal agora?

Ainda é o modelo mais pesado de operar: exige alguém revisando lote item a item no admin
(fotografar, descrever, precificar cada peça) — é trabalho humano por peça que o
marketplace P2P principal não tem (lá quem fotografa e descreve é o próprio vendedor). Cada
lote novo é custo de mão de obra antes de qualquer venda acontecer, e o repasse escalonado
(item 4 acima) já reflete isso — mas não elimina o custo, só o compensa melhor.

**Para a conversa:** ainda faz sentido perguntar se essa vertical deveria ser adiada até o
marketplace P2P principal ter tração provada, em vez de rodar em paralelo desde o
início — ou se ela é estratégica o bastante (capturar quem "nunca anunciaria sozinho") pra
justificar o custo agora. Com o risco de capital resolvido, a balança pende mais pra "vale
manter rodando", mas a pergunta de foco/prioridade de equipe continua válida.

## 4. Cashback — dá pra viver com ele?

> ✅ **Decidido e implementado em 2026-08.** Duas descobertas motivaram essa análise: (1)
> o crédito de cashback é **incondicional em toda venda concluída**, para os dois lados —
> o custo real é sobre 100% do GMV, não sobre uma fração de "usuários que usam cashback"
> como o simulador do produto e uma versão anterior desta análise assumiam; e (2) a taxa
> do vendedor no código estava em **5%**, divergindo do resto do produto (comentário do
> enum, `seed-financial.ts` e o simulador já assumiam 3%). A taxa foi reduzida para 3% em
> `src/lib/cashback.ts`, e a tela `/cashback` — que também mostrava um número errado
> (8%/4% "em planos pagos", uma diferenciação que nunca existiu de verdade) — agora lê a
> taxa direto do código, então não tem mais como os dois divergirem de novo.

**Antes vs. depois da correção** (cenário-base do [04](04-modelo-negocio-financeiro.md) —
80% grátis / 20% Kloop Pro, comissão ponderada 13,6%):

| | Antes (5% vendedor, custo mal calculado) | Depois (3% vendedor, custo sobre 100% do GMV) |
|---|---|---|
| Custo de cashback | ~1% do GMV (cálculo errado) / 7% (cálculo certo, taxa errada) | **5% do GMV** (cálculo e taxa certos) |
| Margem bruta antes de custo fixo | 6,6% a 12,6%, dependendo de qual erro | **8,6%** |
| Break-even, cenário realista (R$15k fixo + 3% gateway) | Mês 7 a 28, dependendo de qual erro | **Mês 19** |
| Break-even, cenário conservador (R$25k fixo + 3,5% gateway) | Mês 20 / não atingido | **Mês 31** |

**Resposta direta às perguntas que motivaram esta seção:**

- **O cashback ajuda a sustentar a vida útil do usuário?** Em teoria sim — o desenho
  (saldo expira em 120 dias, usa até 30% da próxima compra) é o mesmo mecanismo de
  retenção usado por milhas aéreas e crédito de loja: dá motivo pra voltar antes de
  perder o saldo. Mas **não existe dado real de uso** que prove isso — é uma aposta de
  design plausível, não um resultado medido, porque o produto ainda não tem histórico de
  usuários de verdade. Vale ser honesto sobre essa diferença se a banca perguntar.
- **O cashback traz muita despesa pra Kloop?** Traz — é a maior linha de despesa do
  modelo — mas com a taxa corrigida (5% do GMV, não 7%) ela fica coberta com folga
  razoável pela comissão ponderada de 13,6%.
- **Conseguimos viver com o cashback atual?** Sim, com a taxa corrigida — os três
  cenários simulados (piso, realista, conservador) atingem break-even dentro de 3 anos.
  O ponto de atenção que continua válido: essa é receita/custo de um modelo com
  pagamento mockado — a viabilidade real só se confirma quando o gateway de pagamento
  existir de fato.

Alternativas complementares, caso 3% ainda pareça alto depois de mais dados de uso: um
teto de cashback por transação (evita que uma venda cara gere um crédito
desproporcional), ou tratar a taxa como promocional ("cashback de lançamento") em vez de
estrutural — dá espaço pra ajustar pra baixo no futuro sem parecer que "tiraram um
benefício".

## 5. Excesso de superfícies para um primeiro momento?

Contando os sistemas que já existem — negociação por oferta, sacola (mock), cashback,
assinatura, impulsos, combo (desconto por múltiplas peças), conquistas/gamificação, Kloop
Pro + Kloop Shop, comunidades B2B + totem, painel admin completo — é uma quantidade grande
de superfícies pra validar de uma vez. Nenhuma delas é "ruim" isoladamente, mas do ponto
de vista de disciplina de MVP, vale a pergunta: **qual é o loop central que precisa
funcionar bem pra provar que o Kloop faz sentido** (na prática: anunciar → negociar →
comprar → avaliar), e quais são camadas de expansão que reforçam a história pra banca mas
não precisam estar 100% maduras ainda (cashback, gamificação, B2B, Kloop Pro)?

Isso não é uma recomendação de cortar nada — é uma sugestão de **narrativa**: apresentar
com clareza o que é o núcleo validado vs. o que é visão de roadmap costuma ser mais
convincente pra uma banca do que apresentar tudo como se já estivesse igualmente maduro.

## Resumo das perguntas em aberto (pauta pra discussão)

1. ✅ Assinatura — decidido: mantida, mas vendida por impulsos/velocidade + loja
   personalizável (roadmap), não mais pela economia de comissão.
2. ✅ Limite de anúncios grátis — decidido: subiu de 20 para 75.
3. 🟡 Kloop Pro (consignação) — parcialmente decidido: o modelo de repasse virou split
   escalonado 45/55/65% (não é mais "Kloop compra a peça"). Ainda em aberto: correr em
   paralelo com o marketplace principal, ou focar no P2P primeiro?
4. ✅ Cashback — decidido: taxa do vendedor corrigida de 5% para 3% (5% total),
   incondicional sobre 100% do GMV. Modelo viável nos 3 cenários simulados.
5. Pra apresentação: vale desenhar explicitamente "núcleo validado" vs. "camadas de
   expansão" em vez de apresentar tudo no mesmo nível de maturidade?
