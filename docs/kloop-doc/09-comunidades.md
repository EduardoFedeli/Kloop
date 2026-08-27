# 09 — Kloop Comunidades

> Documento dedicado ao principal diferencial do produto. Cobre o que existe hoje no
> código, o que uma comunidade precisa ter pra fazer sentido no Kloop, e as decisões de
> roadmap tomadas em 2026-08 sobre público, financeiro e segurança — a maior parte ainda
> **não está implementada**, é direção de produto decidida, não código pronto. Onde algo é
> só decisão (ainda sem código), está marcado explicitamente.

## O que é, em uma frase

Um feed de compra e venda exclusivo para um grupo fechado que já compartilha proximidade
física e algum nível de confiança prévia — hoje, moradores do mesmo condomínio — vendido
não pessoa a pessoa, mas através de quem já representa esse grupo (o síndico), o que
transforma uma venda em centenas de usuários de uma vez.

## Como funciona hoje (implementado em código)

- Feed exclusivo por comunidade (`/comunidades`, `/comunidades/[slug]`) — anúncios
  vinculados via `ListingCommunity` (N:N), visível só pra membro `ACTIVE`.
- Login físico via Totem — QR code ou código numérico de 6 dígitos num totem instalado no
  prédio, associando a sessão ao usuário já logado no celular.
- Criação de comunidade é **100% manual, feita pelo admin** (`/admin/comunidades`) — não
  existe fluxo de autosserviço, e essa é uma decisão deliberada de escopo, não uma
  limitação técnica esquecida.
- Só existe um tipo disponível: **Condomínio**. "Academia" e "Empresa" aparecem como
  cards desabilitados ("em breve") na tela de criação do admin.
- Ingresso/aprovação de membro também é manual — não existe "solicitar entrada" nem
  "síndico aprova morador" no app; membros são inseridos diretamente.
- `CommunityRule` existe no schema (categoria bloqueada, preço máximo, aprovação
  obrigatória de anúncio) mas sem UI de configuração real além da criação básica.
- **Não gera receita própria ainda** — sem campo de preço/plano no model `Community`.

Ver [02-funcionalidades.md](02-funcionalidades.md) para o detalhamento técnico completo
com arquivos e componentes.

## O que uma comunidade Kloop precisa ter para existir hoje

Duas listas — o que o **produto** exige tecnicamente, e o que faz sentido exigir do
**cliente/prospect** antes de vender, mesmo sem essa validação estar automatizada em
código ainda.

### Requisitos técnicos (o que o admin precisa preencher)

1. Um nome e slug de comunidade.
2. Um usuário (`adminUserId`) que representa a comunidade — hoje é literalmente o
   síndico/responsável cadastrado como usuário Kloop.
3. Tipo = Condomínio (único disponível hoje).
4. Membros adicionados manualmente (com número de unidade/apartamento).

### Requisitos de negócio (o que deveria ser verdade antes de vender)

Baseado na análise de para quem esse modelo realmente funciona (ver seção de roadmap
abaixo):

1. **Existe um decisor institucional único** que pode dizer sim sem precisar convencer
   cada morador — síndico ou administradora. Sem isso, a venda vira boca a boca lenta, o
   que não é o modelo hoje.
2. **Existe proximidade física real** entre os membros, que permite entrega sem frete —
   um prédio, não uma cidade inteira.
3. **Existe algum tipo de custo compartilhado que a comunidade já paga** (taxa
   condominial) — é o que torna o discurso financeiro ("isso ajuda a baixar seu boleto")
   verdadeiro e não só uma frase de marketing.
4. **Existe uma infraestrutura de recebimento/portaria já em uso** — condomínios já têm
   sala de encomendas; isso é reaproveitável como ponto de retirada sem precisar de
   parceiro externo (ver seção de segurança).

Se um prospect não bate esses 4 pontos, ele provavelmente não é o público certo pra
Comunidades no estágio atual do produto — é candidato pra fase futura (ver roadmap).

## Decisão de arquitetura: por que Comunidades não é um sistema separado

> Pergunta que o time se fez pensando numa banca técnica: "Comunidades hoje é só mais uma
> tabela no mesmo banco, gerenciada pelo mesmo app — isso não é simples demais? Se
> tivéssemos mais tempo, não deveria ser um sistema à parte, com banco próprio,
> conversando com o app principal por API?" Resposta: não deveria, e isso é uma decisão
> deliberada, não uma limitação de tempo. Análise completa em
> [06-infraestrutura.md](06-infraestrutura.md#monólito-vs-microsserviços-por-que-comunidades-não-é-um-sistema-separado).

**Em uma frase:** comece monolítico, separe só quando alguma pressão técnica real (não
imaginada) obrigar a separar — e hoje, pra Comunidades, essa pressão não existe. Nem
"banco próprio por condomínio" (isso seria pior que o modelo atual — banco por tenant só
compensa quando há exigência de isolamento contratual, que a Kloop não tem hoje), nem
"API entre os dois sistemas" (só faria sentido se fossem dois sistemas de verdade — a
única fronteira física real, o totem do condomínio, **já** conversa via API,
`/api/totem/*`, exatamente porque ali existe uma fronteira genuína).

**O que isso significa pra escala de dado:** o modelo atual (`Community` com FK em
`CommunityMember`/`Listing`, isolando por linha, não por banco) é o mesmo padrão que a
maioria dos SaaS B2B do mundo usa em escala — inclusive com milhares de comunidades, uma
única base de dados bem indexada aguenta tranquilamente. "Banco por condomínio"
multiplicaria custo operacional (migration em centenas de bancos, relatórios que cruzam
comunidades ficam difíceis) sem resolver nenhum problema que a Kloop tenha hoje.

**Quando reconsiderar de verdade:** um cliente exigindo isolamento de dado por contrato;
a base de comunidades crescendo a ponto de precisar de time/deploy próprios; precisar
integrar com software de gestão de condomínio de terceiros (SuperLógica, Housy — aí a API
seria com o sistema externo, não interna à Kloop); ou a frota de totens físicos crescendo
o bastante pra justificar um serviço dedicado de gestão de dispositivo (provisionamento,
firmware, autenticação de hardware — esse é o único ponto com lógica técnica real hoje).

## Decisões de roadmap (2026-08) — ainda não implementadas em código

### Público: condomínio residencial → condomínio comercial → (fase separada) comunidades de afinidade

**Decisão:** manter o produto em prédios com síndico/administradora — residencial e
comercial — como núcleo do roadmap de curto/médio prazo. Comunidades de afinidade (grupos
sem prédio, sem CNPJ, formados por interesse comum — ex.: um grupo de troca de cartas
colecionáveis que cresce por boca a boca) ficam como uma **iniciativa separada e futura**,
não uma "fase 2" da mesma feature.

**Por que condomínio comercial é o próximo passo natural, não "empresas" em geral:**
prédio comercial tem síndico e administradora — a mesma estrutura de decisão e,
frequentemente, a mesma administradora que já gerencia o prédio residencial. Vender pra
uma administradora que atende os dois tipos é a mesma conversa, o mesmo produto, só muda
o público final. "Empresa" genérica (sem ser dono do prédio) já é outra venda — decisor
vira RH/facilities, ciclo mais longo, sem o gancho financeiro do condomínio.

**Por que comunidades de afinidade são um produto diferente, não uma extensão:**
- Sem decisor institucional — cresceriam por boca a boca, exigindo criação de comunidade
  **self-service** (hoje é 100% admin, de propósito).
- Sem proximidade física garantida — reintroduz frete e risco de estranho, o que o modelo
  atual existe justamente pra evitar.
- Sem parceiro de receita — não tem "taxa condominial" pra ajudar a abater, então o
  modelo financeiro (abaixo) não se aplica; viraria só mais uma fatia de comissão do
  marketplace principal, segmentada por hobby.

Misturar os dois sob o mesmo discurso de "Comunidades" arrisca diluir o que é realmente
defensável (distribuição via síndico, confiança de vizinhança) com algo que compete de
igual pra igual com Facebook Groups/Marketplace, onde o Kloop não tem vantagem nenhuma.

### Financeiro: percentual por transação dividido com o condomínio, não mensalidade

**Decisão:** monetizar via uma fatia da comissão que já é cobrada em cada venda dentro da
comunidade, dividida entre Kloop e o fundo do condomínio — não uma mensalidade fixa cobrada
do condomínio.

**Por que não mensalidade:** despesa nova de condomínio no Brasil passa por aprovação em
assembleia — fricção institucional pesada, cobrada *antes* de qualquer valor comprovado.
Mata a venda antes de começar.

**Por que percentual por transação:**
- Zero risco de adoção pro condomínio — não é despesa, não precisa de assembleia, o
  síndico pode simplesmente habilitar.
- O discurso "ajuda a baixar o boleto" vira um incentivo pra cada morador, não só pro
  síndico — pressão de baixo pra cima pela adoção.
- Alinha o incentivo do Kloop com uso real — só ganha se o comércio de fato acontecer.
- Reaproveita a infraestrutura de comissão que já existe (`Transaction.commissionRate`),
  não exige mecanismo de cobrança novo.

**Como estruturar o split:** não empilhar uma taxa nova em cima do preço pro
comprador/vendedor — dividir a comissão que já existe. Ex.: dos 14% cobrados hoje no plano
grátis, algo como 9-10% fica com o Kloop e 4-5% vai pro fundo do condomínio, exibido de
forma transparente no momento da venda. Mantém o preço igual ao resto do marketplace, sem
criar a pergunta "por que uma venda na comunidade custa mais?". *(Os percentuais exatos
ainda precisam de validação — ver "perguntas em aberto" no fim deste documento.)*

**Sem taxa de setup.** Criar a comunidade continua gratuito — cobrar de entrada reintroduz
a mesma fricção institucional que o modelo de percentual existe pra evitar.

**Upsell opcional futuro — "Comunidades Pro":** uma mensalidade pequena, só pra síndicos
que já veem valor e querem ferramentas extras (relatório de uso pra apresentar em
assembleia, moderação automática, personalização da tela do totem). Diferente da
mensalidade obrigatória rejeitada acima — aqui é opcional, vendida depois que o valor já
foi provado, não como pré-condição de adoção.

### Segurança: regras + reaproveitar a portaria + locker parceiro como visão futura

**O paradoxo a ter em mente:** a mesma confiança que torna Comunidades valioso é o que
torna o vazamento pra fora do app mais fácil — vizinhos que já se conhecem têm menos medo
de fechar negócio "por fora" do que estranhos num marketplace comum. Não existe solução
perfeita pra isso em nenhum marketplace do mundo (Airbnb, Uber, Fiverr convivem com algum
vazamento) — a estratégia é reduzir o incentivo de sair do app, não tentar bloquear 100%.

**Regras da comunidade — dois tipos, propósitos diferentes:**
- *Curadoria* (`CommunityRule` já no schema: categoria bloqueada, preço máximo) — mantém
  o marketplace relevante e mais seguro pro contexto (ex.: bloquear "eletrônicos caros"
  reduz risco de assalto num condomínio residencial).
- *Conduta* — um aceite ao entrar na comunidade ("as vendas devem acontecer pelo Kloop"),
  que não é tanto uma regra que o código força, é uma expectativa social documentada — dá
  respaldo se algo der errado numa negociação feita por fora.

Recomendação: manter o conjunto de regras pequeno (3-4 toggles), não construir um motor de
regras complexo.

**Mitigação de vazamento (nenhuma sozinha resolve, juntas reduzem):**
1. **Cashback e reputação só existem dentro do app** — já é o mecanismo que o Kloop tem.
   Comunicar isso explicitamente: "compre pelo Kloop, ganha cashback e constrói reputação
   com seus vizinhos" — quem sai do app perde os dois.
2. **A ausência de chat privado hoje é uma proteção acidental** — toda comunicação é via
   Q&A público no anúncio (ver [02](02-funcionalidades.md)); combinar por fora hoje exige
   escrever publicamente um contato, o que é visível e um tanto constrangedor. Se um chat
   privado for construído no futuro (era um item discutido em roadmap geral), vale lembrar
   que isso reduz essa proteção — trade-off real a pesar quando chegar a hora.
3. **O risco se concentra em itens de maior valor** — numa peça de R$20 a comissão é
   irrisória, ninguém cria constrangimento com o vizinho por isso; numa peça de R$500 já é
   dinheiro de verdade. Vale considerar algum incentivo extra (cashback maior, por
   exemplo) especificamente pra reter esse segmento de risco dentro de comunidades.
4. **Usar o ângulo cívico na comunicação dentro do app** — "vender pelo Kloop ajuda a
   baixar a taxa condominial de todo mundo, inclusive a sua" é um apelo que nenhum
   marketplace de estranhos consegue fazer.

**Retirada sem contato direto — locker:**

A pergunta de segurança física (comprador e vendedor nunca precisarem se encontrar, mesmo
dentro do mesmo condomínio) tem uma resposta em duas camadas:

- **Agora (sem custo, sem parceiro):** reaproveitar a portaria/sala de encomendas que o
  próprio condomínio já tem. Vendedor deixa o item etiquetado, comprador retira — o
  porteiro nem precisa saber que é do Kloop, é só "encomenda pro apto X". Pra academia, a
  mesma lógica vale com o armário/vestiário que a academia já tem. Zero capex, zero
  negociação com parceiro externo.
- **Visão futura (roadmap, não pra construir agora):** parceria com empresa de locker
  inteligente (modelo usado por Mercado Livre/Correios). Mostra maturidade de produto na
  apresentação, mas não precisa ser real nem simulado tecnicamente agora — é uma
  simulação de TCC, igual ao checkout do Kloop Shop.

**Retirada sem contato não deveria ser obrigatória em todo lugar.** Dentro de um
condomínio, às vezes o vizinho quer combinar na porta, e isso é parte do clima de
vizinhança que dá valor ao produto — forçar retirada anônima ali pode esfriar a
experiência sem necessidade. Recomendação: deixar como **opção** ("retirar na portaria" vs
"combinar entrega"), e só tornar mais fortemente recomendado (quase padrão) em contextos
de confiança mais fraca, como academia.

## Roadmap resumido

| Prazo | Item |
|---|---|
| Curto | Regras de comunidade com UI real (hoje só existem no schema) |
| Curto | Modelo financeiro de split por transação implementado em código (hoje 0% de receita própria) |
| Médio | Autosserviço de ingresso ("solicitar entrada" / "síndico aprova morador") |
| Médio | Habilitar tipo "Condomínio Comercial" (reaproveitando a mesma estrutura de venda via administradora) |
| Médio | Retirada via portaria como opção de entrega dentro do fluxo de transação |
| Longo | "Comunidades Pro" (upsell de ferramentas de gestão pro síndico) |
| Longo/visão | Parceria com locker inteligente |
| Separado, não é "fase 2" | Comunidades de afinidade/interesse sem prédio — produto e go-to-market diferentes, avaliar como iniciativa própria |

## Como apresentar isso pra banca (postura consolidada, 2026-08)

Texto pronto pra slide, juntando público + financeiro + roadmap numa narrativa de 3 fases:

> "O Kloop Comunidades, na Fase 1, atende condomínios residenciais e comerciais —
> vendemos através do síndico ou da administradora, que já gerencia dezenas de prédios de
> uma vez, então uma única conversa comercial abre centenas de usuários. Ganhamos com uma
> porcentagem de cada venda feita dentro da comunidade, dividida com o próprio condomínio
> — não cobramos mensalidade, porque isso exigiria aprovação em assembleia e travaria a
> adoção. Esse modelo tem um efeito colateral bom: ajuda a reduzir a taxa condominial de
> quem usa, o que dá aos próprios moradores um motivo de pressionar o síndico a adotar.
>
> Na Fase 2, expandimos para comunidades ancoradas em CNPJ que não vêm necessariamente de
> um condomínio — empresas, academias — testando um modelo de venda diferente, mais
> direto ao dono/gestor, já que não existe um síndico intermediando.
>
> Na Fase 3, evoluímos a camada de segurança e conveniência com um plano Comunidades Pro:
> parcerias de locker físico e expansão dos totens, pra síndicos que já validaram valor e
> querem uma experiência mais robusta."

**Deliberadamente fora dessa narrativa:** comunidades de afinidade/interesse sem prédio
nem CNPJ (ex.: um grupo de troca de cartas colecionáveis). Não é mentira omitir — é uma
aposta distante o bastante que mencionar junto dilui o discurso institucional (síndico
como canal, taxa condominial como gancho financeiro) que é a força real do argumento.
Guardem essa ideia pra uma pergunta específica da banca, não pro discurso principal.

## Perguntas em aberto

1. Percentual exato do split Kloop/condomínio — usei 9-10%/4-5% como ponto de partida,
   mas vale simular no `/admin/simulador` (uma vez atualizado) antes de bater o martelo.
2. Preço do "Comunidades Pro" — ainda não discutido.
3. Se/quando construir chat privado, como isso muda a estratégia de mitigação de
   vazamento descrita aqui.
4. Critério exato de "confiança mais fraca" que tornaria retirada sem contato o padrão
   (hoje é uma linha qualitativa, não uma regra codificada).
