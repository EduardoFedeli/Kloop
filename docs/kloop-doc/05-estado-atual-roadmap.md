# 05 — Estado Atual e Roadmap

## O que está pronto e funciona ponta a ponta (persistido em banco)

- Cadastro/login (credenciais + Google), verificação de e-mail, onboarding de endereço.
- Anúncios: criação, edição, busca/categorias, Q&A, Smart Price, impulso, combo.
- Negociação: ofertas com contra-proposta (até 4 rodadas), turnos, expiração, cancelamento
  em cascata.
- Transações: máquina de estados completa (`PENDING→PAID→SHIPPED→DELIVERED→COMPLETED`),
  cancelamento com estorno/reversão de cashback.
- Cashback: crédito, débito no checkout, estorno, saldo com expiração.
- Avaliações pós-compra.
- Assinaturas (troca de plano), impulsos dentro da cota do plano.
- Uma conquista de gamificação (primeiros 5 anúncios).
- Kloop Pro: envio de lote → avaliação admin → decisão do usuário → Kloop Shop → repasse
  escalonado ao consignante (45%/55%/65% por faixa de preço), calculado e travado quando o
  admin marca a venda.
- Comunidades: feed exclusivo por comunidade, criação via admin, login por Totem/QR.
- Painel admin completo: vendas, lotes, Kloop Shop, comunidades, usuários, marcas,
  denúncias, simulador financeiro.

## O que existe na tela mas é simulado/mock (não persiste ou não tem integração real)

| Funcionalidade | Limitação atual |
|---|---|
| Pagamento | Sem gateway real — todo o fluxo é simulado (regra deliberada do MVP) |
| Assinatura | Troca o plano no banco, mas sem cobrança, sem cancelamento/downgrade |
| Sacola/carrinho | UI local (Zustand), "finalizar compra" não chama API nenhuma |
| Oferta em lote (`BundleOffer`) | Model existe no banco, rota não grava nada nele |
| Impulso extra | Botão concede +5 grátis, sem cobrança |
| Recebimento de lote Pro | Itens são gerados aleatoriamente, sem upload real de fotos |
| Venda na Kloop Shop | Marcada manualmente pelo admin (`markProductSold`) — sem checkout público pro cliente final ainda; o repasse calculado é real, o dinheiro saindo do caixa não é |

## O que foi removido/descontinuado (decisão de produto, não bug)

- **Favoritos** — código de aplicação removido do app (o model `Favorite` segue no
  schema/banco, sem migration, mas nada usa mais). Era uma feature que nunca ficou
  acessível pro usuário; o time decidiu descartar a ideia em vez de terminá-la.
- **`/plans`** — página stub morta (duplicata de `/assinatura`), removida.

## O que está quebrado/desligado (schema existe, funcionalidade não)

- **Chat direto** — citado nas regras de negócio do `CLAUDE.md`, mas os models
  `Conversation`/`Message` não existem no schema atual. Comunicação hoje é só Q&A público.

> **Correção:** a primeira versão desta doc listava `isTurbinado` como campo morto — isso
> estava errado. É a feature "Combo" (antigo "Turbinado"): desconto automático para quem
> leva 2+ peças do mesmo vendedor na sacola. Está implementada e em uso — ver
> [02](02-funcionalidades.md).

## Roadmap sugerido

Organizado por o que já tem base no schema (mais rápido de destravar) vs. o que é
greenfield (mais trabalho de design + implementação).

### Curto prazo — destravar o que já tem modelo de dados

1. **Unificar a taxa de cashback** entre código, schema e texto da tela (ver
   [04](04-modelo-negocio-financeiro.md)).
2. **Atualizar o simulador administrativo** (`/admin/simulador`) para os 2 planos reais
   (14%/12%) em vez do modelo antigo de 3 planos.
3. **Job de expiração de ofertas** — hoje é "lazy" (só expira quando alguém abre a
   página); um cron job resolveria o caso de uma oferta vencida continuar "ativa" para
   quem nunca mais volta a abri-la.
4. **Cobrança real de assinatura** (gateway) e fluxo de cancelamento/downgrade — sem isso,
   a receita de assinatura continua sendo só uma simulação. Ver
   [08](08-revisao-negocio.md) antes de investir nisso — vale discutir se a assinatura
   do jeito que está desenhada é o modelo certo antes de construir cobrança real pra ela.

### Médio prazo — completar verticais já desenhadas no schema

5. **Loja personalizável para assinantes Kloop Pro** *(compromisso de roadmap assumido)* —
   já reservada como benefício do plano Pro (flag `lojaPersonalizavel: true` na
   `SubscriptionPlan`), mas sem nenhum código que a implemente ainda. Modelo de dados
   `Store`/`StoreBoost` no schema pode servir de base, mas o escopo mínimo é uma vitrine
   de perfil de vendedor customizável (capa, destaque, tema) — não precisa nascer tão
   elaborado quanto os models sugerem. Enquanto não sai do papel, não demonstrar como se
   já existisse.
6. **Autosserviço de Comunidades + Condomínio Comercial** *(decisão de roadmap tomada em
   2026-08, ver [09-comunidades.md](09-comunidades.md))* — hoje só existe o tipo
   "Condomínio" (residencial), criado manualmente pelo admin, sem fluxo de "solicitar
   entrada" / "síndico aprova morador". O próximo tipo a habilitar é **condomínio
   comercial**, não "empresa" genérica — reaproveita a mesma estrutura de venda via
   síndico/administradora. Comunidades de afinidade sem prédio (ex.: grupos de interesse)
   ficam explicitamente fora deste item — são uma iniciativa separada, não uma extensão.
7. **Monetização do B2B** *(modelo já decidido, falta implementar)* — split percentual
   por transação dividido entre Kloop e o condomínio (não mensalidade fixa, não taxa de
   setup) — ver [09-comunidades.md](09-comunidades.md) para a análise completa. Hoje o
   `Community` não tem nenhum campo de plano/preço no schema.
8. **Chat direto comprador-vendedor** — se o produto realmente quer manter comunicação só
   por Q&A público, vale atualizar o `CLAUDE.md` para refletir isso; se o chat é desejado,
   é uma feature nova (models `Conversation`/`Message` + UI).

### Longo prazo — escala

9. ✅ **Kloop Pro como consignação de verdade** *(concluído em 2026-08)* — repasse
   escalonado 45%/55%/65% por faixa de preço, implementado em
   `src/lib/kloopShopPayout.ts`. O que falta agora não é mais o modelo econômico, é o
   **checkout público da Kloop Shop** — hoje a venda é marcada manualmente pelo admin, não
   existe fluxo de compra real pro cliente final na vitrine `/kloop-shop`.
10. **Boosts avançados** — `FEED_HIGHLIGHT`, `CATEGORY_TOP`, `SEARCH_PRIORITY` já existem
    no enum mas não têm lógica; poderiam virar upsells pagos avulsos (hoje só o impulso
    dentro da cota do plano existe).
11. **Evolução de infraestrutura** — ver [06-infraestrutura.md](06-infraestrutura.md) para
    a proposta de quando/como sair do serverless atual.
