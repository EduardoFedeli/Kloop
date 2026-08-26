# 02 — Catálogo de Funcionalidades

> Cada funcionalidade traz: o que é, como funciona (regras reais do código) e um selo de
> estado — 🟢 **implementado** (persiste em banco, funciona ponta a ponta), 🟡 **simulado/mock**
> (existe na tela mas não persiste, ou não tem cobrança/integração real), 🔴 **stub/quebrado**
> (rota existe mas não faz o que o nome sugere), ⚫ **removido/descontinuado** (existiu ou
> foi desenhado, decisão do time foi tirar do app — citado aqui só para não ressurgir por
> engano). Fonte: mapeamento completo de
> `src/app/(auth)`, `src/app/(main)`, `src/app/admin` e `src/app/api`, mais os arquivos de
> `src/lib/actions/*`.

## Conta e autenticação

- 🟢 **Cadastro e login** (`/register`, `/login`) — e-mail+senha (bcrypt) ou Google OAuth,
  via Auth.js (NextAuth v5). Login por credenciais exige e-mail verificado; login Google é
  aceito direto.
- 🟢 **Verificação de e-mail** (`/verify`, `/verify-pending`) — token expira em 24h, com
  reenvio (`/api/auth/resend-verification`) via Resend.
- 🟢 **Onboarding — endereço obrigatório** (`/completar-perfil`) — bloqueia o uso pleno do
  app até o usuário cadastrar um endereço (necessário para calcular frete/comissão).
- 🟢 **Login por Totem (QR/código de condomínio)** (`/totem-access`, `/api/totem/**`) —
  fluxo à parte do NextAuth: o totem físico gera um token de 60s (QR + código numérico de
  6 dígitos); o usuário confirma pelo celular já logado; o totem faz polling e libera
  acesso apenas se o usuário for membro **ativo** daquela comunidade. Ver detalhe na
  seção "Comunidades B2B" e schema `TotemToken`.

## Perfil e identidade

- 🟢 **Edição de perfil** (`/perfil/perfil`) — nome, telefone, avatar, capa, bio, gênero.
- 🟢 **Endereços** (dentro do perfil) — múltiplos endereços, um padrão (`isDefault`),
  usados para frete e para exigir endereço antes de anunciar/comprar.
- 🟢 **Perfil público do vendedor** (`/profile/[id]`) — vitrine com listagens ativas,
  filtros (preço, condição, marca, tamanho), reputação.
- 🟢 **Seguir vendedores** (`Follow`) e **seguir marcas** (`BrandFollow`, `/perfil/marcas`)
  — com opção de notificações habilitadas por follow.
- 🟢 **Histórico de visualizados** (`/perfil/historico`) — últimos 30 anúncios ainda
  ativos que o usuário visitou (`ViewHistory`).
- ⚫ **Favoritos — descontinuado e removido.** Existiu uma implementação parcial
  (`toggleFavorite`, `FavoriteButton`, `FavoritosClient`), mas nunca ficou acessível pro
  usuário de verdade — foi uma ideia descartada pelo próprio time e o código foi removido
  do app (o model `Favorite` continua no schema/banco por enquanto, sem migration, mas
  nenhum código de aplicação o usa mais). Não citar como feature existente nem planejada.
- 🟢 **Denúncias** (`Report`) — denunciar usuário ou anúncio; moderado no admin
  (`/admin/denuncias`, `/admin/reports`).

## Descoberta

- 🟢 **Feed principal** (`/`) — seções por comunidade, destaques, listagens recentes,
  prioriza anúncios megafonados (`isMegafonado && megafonadoUntil > now`).
- 🟢 **Busca com filtros** (`/search`) — por categoria, com busca recursiva de
  subcategorias (taxonomia importada de `categorias.csv`, 4 níveis: departamento →
  categoria → subcategoria → característica).
- 🟢 **Páginas de departamento** (`/casa`, `/mocas`, `/rapazes`, `/kids`) — landing
  estática por segmento, com cards de subcategoria. Os rótulos visíveis no menu foram
  atualizados para **Feminino / Masculino / Infantil** (tom menos "jovem/copiado do
  Enjoei", pedido do time) — as URLs continuam `/mocas`, `/rapazes`, `/kids` por baixo,
  só o texto mudou.
- 🟢 **Marcas** (`/marcas`, `/marca/[slug]`) — grade de marcas ativas e vitrine por marca,
  com contagem de seguidores. CRUD de marca é feito pelo admin (`/admin/marcas`).

## Anúncios (listings)

- 🟢 **Criar anúncio** (`/create`) — valida limite de anúncios ativos do plano do
  vendedor, exige endereço cadastrado, upload de imagens via Cloudinary.
- 🟢 **Editar anúncio** (`/listing/[slug]/edit`) — restrito ao dono.
- 🟢 **Página de produto** (`/listing/[slug]`) — carrossel de imagens, ações de
  compra/oferta, Q&A, seguir vendedor, denunciar, tracking de visualização (com cookie
  anti-duplicidade de 20 min).
- 🟢 **Perguntas e Respostas (Q&A)** (`Question`/`Answer`, no próprio anúncio) — pergunta
  pública sobre o item, resposta do vendedor. Único canal de comunicação pré-venda hoje —
  **não existe chat direto** (models `Conversation`/`Message` citados no `CLAUDE.md` como
  regra de negócio **não existem no schema atual**; toda comunicação passa por Q&A público
  no anúncio, não por mensagem privada).
- 🟢 **Smart Price** (`smartPriceEnabled`, `idealPriceMinCents/MaxCents`) — o vendedor
  define uma faixa de aceite automático; ofertas dentro da faixa são aceitas na hora sem
  ele precisar agir. Ver [03](03-fluxo-oferta-comercio.md).
- 🟢 **Impulso** (antigo "megafone"/"turbinar", `/vendas/megafone`) — destaque por 7 dias
  no feed, consome cota semanal do plano (ou saldo extra), com desconto obrigatório em
  anúncios parados (10% se ≥29 dias, 5% se ≥8 dias). Ver [04](04-modelo-negocio-financeiro.md).
  Campo no banco (`isMegafonado`/`megafonadoUntil`) não foi renomeado, só o texto exibido.
- 🟢 **Combo** (antigo "Turbinado", `isTurbinado`) — **é uma feature diferente do
  Impulso, e vale não confundir as duas.** É um modo escolhido na criação/edição do
  anúncio ("Clássico" vs. "Combo") que dá desconto automático ao comprador que leva 2 ou
  mais peças do mesmo vendedor na sacola (`calcTurbinadoDiscount` em `src/store/cart.ts`).
  Aparece como carrossel "sacolas combo" na home, badge no card do anúncio, e filtro na
  lojinha do vendedor ("só combos"). **Correção:** a primeira versão desta doc dizia que
  `isTurbinado` era um campo morto — estava errado, é uma feature real e usada em vários
  lugares (`HomeFeed.tsx`, `ListingCard.tsx`, `ProfileStoreClient.tsx`,
  `CreateListingForm.tsx`, `sacola/page.tsx`).

## Oferta, negociação e transação

Coberto em detalhe em [03 — Fluxo de Oferta e Comércio](03-fluxo-oferta-comercio.md):
compra direta, ofertas com até 4 rodadas e prazo de 24h, cancelamento em cascata, máquina
de estados da transação (`PENDING→PAID→SHIPPED→DELIVERED→COMPLETED`), checkout mockado
(sem gateway real), avaliações pós-compra.

- 🟡 **Sacola/carrinho** (`/sacola`) — agrupa vários anúncios do mesmo vendedor;
  "finalizar compra" é só um toast de sucesso, sem chamada de API. O botão "oferta em
  lote" chama `/api/bundle-offers`, que **não grava no banco** (mock explícito no código).
- 🟢 **Avaliações (reviews)** — só o comprador avalia, só após `COMPLETED`. Tags viram
  texto concatenado no campo `comment` (não é coluna estruturada).

## Cashback

- 🟢 **Carteira de cashback** (`/cashback`) — saldo, extrato, aviso de saldo prestes a
  expirar (15 dias antes do vencimento em 120 dias).
- 🟢 **Uso no checkout** — até 30% do valor da compra pode ser pago com saldo de cashback.
- 🟢 **Taxa: 5% do valor, só pro comprador**, incondicional em toda venda concluída,
  sempre igual independente do plano. Desde 2026-08 o vendedor não recebe mais cashback —
  decisão de simplificação (ver [08](08-revisao-negocio.md)): dois mecanismos diferentes
  não deveriam disfarçar de um só, e o incentivo do vendedor já vem de
  assinatura/impulsos/comissão. Ver [04](04-modelo-negocio-financeiro.md) para a análise
  financeira completa.

## Assinaturas e monetização B2C

- 🟡 **Planos** (`/assinatura`) — só **2 planos ativos**: Kloop (grátis, comissão 14%,
  75 anúncios, 5 impulsos/semana) e Kloop Pro (R$14,99/mês, comissão 12%, anúncios
  ilimitados, 20 impulsos/semana). O limite do plano grátis foi levantado de 20 para 75
  anúncios (decisão de 2026-08 — ver [08](08-revisao-negocio.md)) justamente para não
  penalizar o usuário casual fazendo desapego, sem depender de uma parede de anúncios
  pra empurrar a assinatura. Assinar troca o plano no banco instantaneamente —
  **sem gateway de pagamento, sem cancelamento, sem downgrade** implementados. Ver
  [04](04-modelo-negocio-financeiro.md) para os números e a análise de se vale a pena.
- ⚫ **`/plans`** — era uma rota stub (`<div>Planos</div>`), duplicata morta de
  `/assinatura`. Removida do app.

## Gamificação

- 🟢 **Conquistas/Missões** (`/vendas/metas`, `/vendas/missoes`) — hoje só **uma**
  conquista implementada: "Primeiros 5 anúncios", que paga R$30 de cashback ao publicar 5
  anúncios (não-rascunho). A lista de conquistas é estática no código
  (`src/lib/actions/achievements.ts`), não uma tabela configurável.

## Kloop Pro (consignação) e Kloop Shop

- 🟢 **Envio de lote** (`/pro`, `/pro/anuncio`, `/pro/sucesso`, `/pro/dashboard`) — usuário
  escolhe método de envio (Correios ou coleta) e se usa saco/bag da Kloop. **O recebimento
  físico e a triagem inicial são simulados**: o lote já nasce com status `ANALYZING` e
  itens gerados aleatoriamente por uma lista fixa no código (`generateRandomItems`) — não
  há upload real de fotos das peças nem rastreio de transportadora integrado.
- 🟢 **Avaliação do lote pelo admin** (`/admin/lotes/[id]`) — aprova item por item com
  preço sugerido, ou rejeita com nota.
- 🟢 **Decisão do usuário sobre cada item aprovado** — publicar na Kloop Shop, doar ou
  pedir devolução. Itens rejeitados pelo admin também podem ser marcados para doação ou
  devolução pelo usuário.
- 🟡 **Kloop Shop** (`/kloop-shop`, gestão em `/admin/kloop-shop`) — vitrine dos produtos
  aprovados e publicados. **Desde 2026-08, é consignação de verdade com repasse
  escalonado** ao consignante: 45% (peças até R$79,99), 55% (R$80,00–R$299,99) ou 65%
  (R$300,00+) — calculado em `src/lib/kloopShopPayout.ts` e travado quando o admin marca o
  produto como "vendido" (`markProductSold`). O consignante acompanha o valor
  estimado/recebido pelo `/pro/dashboard`. **Ainda simulado no sentido de que não existe
  checkout público** para o cliente final comprar na Kloop Shop — a "venda" hoje é marcada
  manualmente pelo admin, e o repasse é só um número travado no banco, sem PIX/transferência
  de verdade saindo ainda. Ver [04](04-modelo-negocio-financeiro.md) para a análise completa.

## Comunidades B2B (condomínios)

> Ver [09-comunidades.md](09-comunidades.md) para a análise completa de negócio (público,
> financeiro, segurança) e o roadmap dessa vertical — este catálogo cobre só o que já
> está implementado.

- 🟢 **Feed exclusivo por comunidade** (`/comunidades`, `/comunidades/[slug]`) — lista as
  comunidades do usuário e, dentro de cada uma, os anúncios vinculados a ela
  (`ListingCommunity`, relação N:N atual; `Listing.communityId` é o campo legado 1:N,
  mantido no schema mas deprecated). Acesso ao feed exige membro `ACTIVE`.
- 🟢 **Login físico via Totem** — ver seção "Conta e autenticação" acima.
- 🟡 **Ingresso/aprovação de membro** — o schema modela isso (`CommunityMember.status`
  `PENDING/ACTIVE/SUSPENDED/REMOVED`), mas **não existe fluxo de autosserviço no app**: só
  o admin cria comunidades e membros são inseridos manualmente (via seed/DB direto). Não
  há tela de "solicitar entrada" nem "aprovar morador" hoje.
- 🟢 **Criação de comunidade (admin)** (`/admin/comunidades`) — só tipo "Condomínio"
  disponível; "Academia" e "Empresa" aparecem como cards desabilitados ("em breve").
- 🟡 **Regras de comunidade** (`CommunityRule` — categoria bloqueada, preço máximo,
  aprovação obrigatória de anúncio) — modeladas no schema, sem UI de configuração
  encontrada além da criação básica da comunidade.

## Notificações

- 🟢 **Central de notificações** (`/notificacoes`) — curtidas, ofertas, oferta em lote,
  venda concluída, pergunta/resposta, queda de preço, oferta aceita (`NotificationType`).

## Painel administrativo

Login próprio (usuário/senha via variável de ambiente, cookie `admin_token` — **não usa
NextAuth nem RBAC por usuário**, é um segredo único compartilhado entre admins):

| Página | Função |
|---|---|
| `/admin/vendas`, `/admin/vendas/[id]` | Dashboard e detalhe financeiro de transações (comissão, cashback, líquido ao vendedor) |
| `/admin/simulador` | Simulador de viabilidade financeira (ver [04](04-modelo-negocio-financeiro.md)) |
| `/admin/lotes`, `/admin/lotes/[id]` | Avaliação de lotes do Kloop Pro |
| `/admin/kloop-shop` | Gestão de produtos publicados na Kloop Shop |
| `/admin/comunidades` | Criação/listagem de comunidades |
| `/admin/usuarios` | Lista de usuários, edição de nome/role/verificação |
| `/admin/marcas` | CRUD de marcas |
| `/admin/denuncias`, `/admin/reports` | Moderação de denúncias |

## Funcionalidades citadas no `CLAUDE.md` que não existem no código hoje

Para não gerar surpresa numa pergunta da banca sobre regras já documentadas no projeto:

- **Chat direto** (`Conversation`/`Message`) — descrito como o único canal de comunicação
  nas regras de negócio do projeto, mas **esses models não existem no schema Prisma
  atual**. A comunicação real hoje é só via Q&A público no anúncio.
- **`/vendas/metricas`** e **`/vendas/promocoes`** — placeholders "em breve", sem lógica.
