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
A margem bruta por transação é saudável — a comissão ponderada (~13-14% do GMV) cobre com
folga o cashback pago (7% do valor, só sobre quem escolhe usar). O que determina se o
negócio é lucrativo de verdade não é a comissão, é o custo de operar (infra, equipe,
aquisição de usuário, taxa de gateway). Simulamos cenários com custo operacional realista
e o break-even acontece já no primeiro semestre com um time enxuto — o modelo atual (2
planos) é mais robusto do que uma versão anterior desta análise, que usava números de um
modelo antigo de 3 planos.

**"Por que alguém pagaria assinatura em vez de usar o plano grátis?"**
Hoje só existem 2 planos: grátis (14% de comissão, 20 anúncios) e Kloop Pro (R$14,99/mês,
12% de comissão, anúncios ilimitados, mais impulsos). A redução de comissão é pequena (só
2 pontos percentuais), então na prática ela só compensa financeiramente a partir de ~5
vendas por mês — abaixo disso, quem assina está pagando pelos outros benefícios (limite
de anúncios, impulsos), não pela economia de taxa. Vale ser transparente sobre isso: é uma
resposta honesta, e evita prometer um ROI de assinatura maior do que o real. Há uma
discussão em aberto sobre se esse desenho é o ideal — ver [08](08-revisao-negocio.md).

**"Qual o diferencial de vocês frente a Enjoei, OLX, Facebook Marketplace?"**
Negociação estruturada com prazo e limite de rodadas (em vez de combinar por chat e o
vendedor sumir), cashback nos dois lados da transação, e uma vertical B2B para
condomínios que nenhum concorrente direto explora hoje. Ver [01](01-visao-geral-negocio.md).

**"O modelo B2B (condomínios) já dá dinheiro?"**
Ainda não — hoje é uma ferramenta de aquisição/retenção (cria uma rede de confiança
fechada dentro do prédio), sem cobrança própria implementada. É roadmap, não receita atual
— e é importante dizer isso claramente se perguntado, em vez de deixar parecer que já é
uma fonte de receita validada.

**"E a Kloop Pro (mandar o lote de roupas), o dono da peça recebe alguma coisa?"**
No modelo implementado hoje, a Kloop avalia o lote e, para os itens aprovados que o
usuário decide publicar, a peça vira um produto da "Kloop Shop" — o modelo de dados atual
não tem um campo de repasse percentual ao usuário original. Ou seja, hoje funciona mais
como "a Kloop compra a peça aprovada" do que consignação com split — uma decisão de
produto que ainda pode evoluir (está no roadmap).

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

## Perguntas armadilha (inconsistências que o time deve saber de cor)

Estas foram encontradas revisando o código para montar esta documentação — é melhor o
time já saber a resposta do que ser pego de surpresa:

- **"Qual a taxa de cashback, 3%, 5% ou 8%?"** → A implementação real usa **5% para o
  vendedor + 2% para o comprador (7% total)**, sempre igual independente do plano. O
  comentário do schema e o simulador administrativo ainda citam 3%, e o texto da tela de
  cashback cita 8%/4% "em planos pagos" (que não existe de verdade) — é uma inconsistência
  de texto/comentário que vale corrigir, não um erro de cálculo real.
- **"Existe favoritar anúncios?"** → Não — foi uma ideia avaliada e descartada pelo time,
  removida do produto. Não é uma feature planejada nem quebrada, é uma decisão de escopo.
- **"Como funciona o chat com o vendedor?"** → Hoje não existe chat privado — a
  comunicação é via Perguntas e Respostas públicas no próprio anúncio. Se o `CLAUDE.md` do
  projeto ainda cita "chat direto" como regra de negócio, isso está desatualizado frente
  ao código e vale alinhar.
