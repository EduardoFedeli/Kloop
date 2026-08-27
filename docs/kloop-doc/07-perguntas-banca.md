# 07 — Perguntas Prováveis da Banca (com respostas prontas)

> A banca não deve fazer perguntas técnicas de código, mas costuma testar se o time
> entende o **próprio negócio**: monetização, diferenciação, viabilidade, e se o time é
> honesto sobre limitações. As respostas abaixo já incorporam os pontos de atenção
> levantados nos documentos anteriores — leiam também [04](04-modelo-negocio-financeiro.md)
> e [05](05-estado-atual-roadmap.md) antes da apresentação.

## Sobre o negócio

**"Como o Kloop ganha dinheiro?"**
Duas fontes principais: comissão sobre cada venda concluída (14% no plano grátis, 12% no
Kloop Pro) e assinatura mensal do Kloop Pro (R$14,99) para vendedores que querem mais
anúncios e mais impulsos. Ver [04](04-modelo-negocio-financeiro.md).

**"Isso é suficiente para dar lucro?"**
Sim. A comissão ponderada (~13,6% do GMV) cobre o cashback (5% do GMV, **incondicional em
toda venda concluída** — não só "sobre quem escolhe usar", ver [08](08-revisao-negocio.md))
com uma margem bruta de ~8,6% antes de custo operacional. Com custo operacional realista
(equipe, infra, gateway), o break-even acontece por volta do mês 19 — e mesmo num cenário
mais conservador de custos, dentro do mês 31, ainda dentro do horizonte de 3 anos.

**"Por que só o comprador ganha cashback, e não o vendedor também?"**
Decisão deliberada de simplificação. Cashback, pra qualquer usuário brasileiro, é um
conceito ligado a "gastar e receber parte de volta" (cartão de crédito, PicPay, Méliuz) —
dar cashback pro vendedor por *vender* algo é um mecanismo diferente disfarçado do mesmo
nome, mais confuso de explicar sem trazer benefício real: o incentivo do vendedor já vem
de outro lugar (assinatura Kloop Pro, impulsos, comissão menor). Concentrar tudo no
comprador simplifica o discurso ("toda compra dá 5% de volta") sem mudar o custo total
pra Kloop, que continua 5% do GMV. Ver [08](08-revisao-negocio.md) para a análise.

**"Por que alguém pagaria assinatura em vez de usar o plano grátis?"**
Hoje só existem 2 planos: grátis (14% de comissão, 75 anúncios) e Kloop Pro (R$14,99/mês,
12% de comissão, anúncios ilimitados, 20 impulsos/semana). A redução de comissão é pequena
(só 2 pontos percentuais) e o limite do plano grátis é alto o bastante pra raramente ser o
motivo real de assinar — de propósito: quem assina hoje está pagando por impulsos/
velocidade e (no roadmap) loja personalizável, não por "desbloquear" o básico. Essa
mudança foi feita justamente pra não punir o usuário casual fazendo desapego, que é o
público-alvo primário do produto — ver a análise completa em [08](08-revisao-negocio.md).

**"Qual o diferencial de vocês frente a Enjoei, OLX, Facebook Marketplace?"**
Negociação estruturada com prazo e limite de rodadas (em vez de combinar por chat e o
vendedor sumir), cashback de 5% em toda compra, e uma vertical B2B para
condomínios que nenhum concorrente direto explora hoje. Ver [01](01-visao-geral-negocio.md).

**"O modelo B2B (condomínios) já dá dinheiro?"**
Ainda não — hoje é uma ferramenta de aquisição/retenção (cria uma rede de confiança
fechada dentro do prédio), sem cobrança própria implementada. É roadmap, não receita atual
— e é importante dizer isso claramente se perguntado, em vez de deixar parecer que já é
uma fonte de receita validada.

**"E a Kloop Pro (mandar o lote de roupas), o dono da peça recebe alguma coisa?"**
Sim — é consignação de verdade com repasse escalonado por faixa de preço: 45% em peças
até R$79,99, 55% de R$80 a R$299,99, e 65% em peças de R$300 ou mais. A lógica: a Kloop
faz todo o trabalho por peça (foto, anúncio, guarda, envio), então peças baratas dão mais
margem pra Kloop (o trabalho é quase o mesmo de uma peça cara) e peças caras dão mais
repasse ao dono (o valor absoluto já compensa). É mais generoso que o modelo fixo de
50/50 do Enjoei nas peças de maior valor, sem comprometer a margem nas baratas — que são a
maioria do volume. O repasse é calculado e travado quando a venda é registrada. O que
ainda não existe é um checkout público de verdade pra Kloop Shop (a venda hoje é marcada
manualmente pelo admin) — bom ser transparente sobre isso se perguntado a fundo.

## Sobre validação e mercado

**"Como vocês sabem que existe demanda para isso?"**
Framing recomendado: apontar o comportamento já existente (grupos de bairro no
WhatsApp/Facebook revendendo informalmente, sucesso do Enjoei nacionalmente) como
evidência de mercado, e posicionar o Kloop como a evolução estruturada disso — não como
uma categoria nova sendo criada do zero.

**"Quem é o usuário que vocês imaginam primeiro?"**
Duplo perfil: quem já revende informalmente e quer mais alcance/confiança (oferta
estruturada, reputação, cashback), e moradores de condomínio que preferem transacionar
com vizinhos a com desconhecidos da internet.

## Sobre o estado do projeto

**"O app está pronto? Funciona de verdade?"**
Sim, o fluxo principal (cadastro → anunciar → negociar → comprar → avaliar) funciona
ponta a ponta com dados reais no banco. O que é simulado, e vale ser transparente sobre
isso, é: pagamento (sem gateway real), cobrança de assinatura, e o carrinho/sacola (mock
de interface). Ver [05](05-estado-atual-roadmap.md) para a lista completa.

**"Por que simular o pagamento em vez de integrar um gateway de verdade?"**
Escopo de MVP/TCC — o objetivo era provar o fluxo de produto e a lógica de negócio
(comissão, cashback, negociação), não processar dinheiro real. Integrar um gateway (Pix,
cartão) é o próximo passo natural antes de um piloto com usuários reais.

## Sobre infraestrutura (se perguntarem, mesmo não sendo o foco)

**"Onde isso roda? Aguenta muito usuário?"**
Hoje roda em Vercel (aplicação) + Neon (banco Postgres serverless) — ambos escalam
automaticamente e sem custo relevante em baixo tráfego, o que é apropriado para a fase
atual. Para uma escala maior, o caminho natural é migrar para infraestrutura dedicada (ex.
duas instâncias EC2, uma para a aplicação e outra para o banco) quando o custo/tráfego
justificar — está detalhado como proposta de roadmap em [06](06-infraestrutura.md), não
como algo já em andamento.

**"Por que Comunidades não é um sistema separado, com banco próprio e API conversando
com o app principal?"**
Decisão deliberada, não falta de tempo. Comece monolítico, separe só quando alguma
pressão técnica real obrigar — e hoje essa pressão não existe pra Comunidades: sem time
separado, sem necessidade de escalar independente, sem exigência de isolamento de dado
por cliente. "Banco por condomínio" seria, na real, um passo atrás (multiplicaria custo
operacional sem resolver nenhum problema que a Kloop tenha); o modelo atual (uma tabela
`Community` com FK, isolando por linha) é o mesmo padrão que a maioria dos SaaS B2B do
mundo usa em escala. Onde uma fronteira de sistema é genuína — o totem físico do
condomínio — ela **já** é tratada como tal, com API própria (`/api/totem/*`). Sabemos
exatamente os gatilhos que justificariam reconsiderar (isolamento contratual de dado,
integração com software de gestão de condomínio de terceiros, ou uma frota grande de
totens exigindo um serviço dedicado de gestão de dispositivo) — análise completa em
[06](06-infraestrutura.md) e [09](09-comunidades.md).

## Perguntas armadilha (inconsistências que o time deve saber de cor)

Estas foram encontradas revisando o código para montar esta documentação — é melhor o
time já saber a resposta do que ser pego de surpresa:

- **"Existe favoritar anúncios?"** → Não — foi uma ideia avaliada e descartada pelo time,
  removida do produto. Não é uma feature planejada nem quebrada, é uma decisão de escopo.
- **"Como funciona o chat com o vendedor?"** → Hoje não existe chat privado — a
  comunicação é via Perguntas e Respostas públicas no próprio anúncio. Se o `CLAUDE.md` do
  projeto ainda cita "chat direto" como regra de negócio, isso está desatualizado frente
  ao código e vale alinhar.
