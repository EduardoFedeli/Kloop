# Documentação Kloop — Índice

> Este conjunto de documentos existe para dois públicos: (1) os membros do time, para
> entenderem o projeto por completo antes da apresentação do TCC; e (2) como fonte de
> conteúdo para montar os slides da apresentação (texto, números, prints, paleta).
>
> Trata do produto como ele é HOJE no código — não é um documento de marketing. Onde algo
> ainda não existe ou é só maquete visual, isso está marcado explicitamente.

## Como navegar

| Arquivo | Conteúdo |
|---|---|
| [01-visao-geral-negocio.md](01-visao-geral-negocio.md) | O que é o Kloop, proposta de valor, mercado-alvo, diferenciais, stack |
| [02-funcionalidades.md](02-funcionalidades.md) | Catálogo completo de funcionalidades do app |
| [03-fluxo-oferta-comercio.md](03-fluxo-oferta-comercio.md) | Fluxo detalhado: anúncio → oferta/negociação → transação → entrega → review |
| [04-modelo-negocio-financeiro.md](04-modelo-negocio-financeiro.md) | Como o Kloop ganha dinheiro, números reais do simulador, viabilidade |
| [05-estado-atual-roadmap.md](05-estado-atual-roadmap.md) | O que está pronto vs. planejado, próximos passos |
| [06-infraestrutura.md](06-infraestrutura.md) | Arquitetura técnica atual e proposta de evolução de infra |
| [07-perguntas-banca.md](07-perguntas-banca.md) | Perguntas prováveis da banca com respostas prontas |
| [08-revisao-negocio.md](08-revisao-negocio.md) | Crítica de negócio: o que pode ser desnecessário hoje (assinatura, limite de anúncios, Kloop Pro, cashback) |
| [09-comunidades.md](09-comunidades.md) | Kloop Comunidades a fundo: como funciona, requisitos, roadmap de público/financeiro/segurança |

## Resumo executivo (1 minuto)

**Kloop** é um marketplace de desapegos (moda, calçados, acessórios e casa em estado
seminovo) focado no mercado brasileiro, com proposta de sustentabilidade e economia
circular. O modelo de negócio combina **comissão por venda** (14% no plano grátis, 12% no
Kloop Pro) com **assinatura B2C** (só 2 planos hoje — o antigo plano intermediário "Pro"
foi desativado). Diferenciais frente a Enjoei/OLX/Facebook Marketplace: negociação de
preço estruturada (ofertas com turnos e prazo), cashback de 5% para o comprador,
sistema de "impulsos" para dar destaque a anúncios, consignação Kloop Pro/Kloop Shop com
repasse escalonado (45%/55%/65% por faixa de preço) para quem não quer fotografar e
anunciar sozinho, e uma vertical B2B para condomínios residenciais (Kloop Comunidades).

O projeto está em estado de **MVP funcional**: cadastro, anúncios, busca, ofertas,
transações, avaliações, assinaturas, cashback e boosts estão implementados e persistidos
em banco. Carrinho/sacolinha como conceito de UI e o gateway de pagamento real ainda não
existem — o fluxo de compra é simulado ponta a ponta. A feature de Favoritos foi
descontinuada e removida (era uma ideia descartada, nunca chegou a ficar acessível pro
usuário).
