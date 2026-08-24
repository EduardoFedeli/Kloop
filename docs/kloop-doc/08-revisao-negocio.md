# 08 — Revisão de Negócio (para discussão)

> Esta seção é diferente das anteriores: não descreve o que existe, **questiona** o que
> existe, com chapéu de "técnico em empreendedorismo" olhando pra decisões de produto sob
> a ótica de negócio (não de código). Nada aqui é uma decisão tomada — é munição para a
> conversa entre vocês sobre o que manter, simplificar ou adiar. Onde eu tenho uma opinião
> forte, digo; onde é mais uma pergunta em aberto, também digo.

## 1. A assinatura vale o esforço que ela custa?

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

Hoje é o modelo mais pesado de operar: exige alguém revisando lote item a item no admin, e
o modelo implementado (a Kloop compra a peça, não é consignação com repasse) significa que
a Kloop assume risco de estoque e capital de giro **antes de saber se a peça vende**. Isso
é um modelo de negócio fundamentalmente diferente do marketplace P2P principal (onde o
Kloop nunca segura estoque, só intermedia) — e mais caro de escalar, porque cada lote
precisa de trabalho humano de avaliação.

**Para a conversa:** faz sentido perguntar se essa vertical deveria ser adiada até o
marketplace P2P principal ter tração provada, em vez de rodar em paralelo desde o
início — ou se ela é estratégica o bastante (capturar quem "nunca anunciaria sozinho") pra
justificar o custo agora. Não tem resposta errada aqui, é uma escolha de foco.

## 4. Cashback de 7% — dá pra prometer isso pra sempre?

Cashback fixo desde o dia um cria uma expectativa difícil de reduzir depois sem reação
negativa dos usuários (todo produto que já cortou benefício de fidelidade sabe disso). Vale
considerar, para a conversa: um teto de cashback por transação/mês (evita que uma venda
gigante gere um crédito desproporcional), ou tratar a taxa atual como promocional
("cashback de lançamento") em vez de estrutural — dá espaço pra ajustar sem parecer que
"tiraram um benefício".

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

1. Assinatura: manter como está, vender por outro motivo (não a comissão), ou adiar pra
   fase 2?
2. Limite de 20 anúncios grátis: manter, subir bastante, ou remover?
3. Kloop Pro (consignação): correr em paralelo com o marketplace principal, ou focar no
   P2P primeiro?
4. Cashback de 7%: manter como benefício permanente, ou reposicionar como promocional
   com teto?
5. Pra apresentação: vale desenhar explicitamente "núcleo validado" vs. "camadas de
   expansão" em vez de apresentar tudo no mesmo nível de maturidade?
