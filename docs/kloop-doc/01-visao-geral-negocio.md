# 01 — Visão Geral do Negócio

## O que é o Kloop

Kloop é um **marketplace consolidador de desapegos**: uma plataforma onde pessoas físicas
vendem e compram itens seminovos entre si — moda (roupas, calçados, acessórios, bolsas,
relógios), beleza e casa/decoração — com foco no público brasileiro. "Consolidador"
porque a proposta não é ser só mais um classificado, e sim reunir num único produto o que
hoje está espalhado entre grupos de WhatsApp/Facebook, Enjoei, OLX e brechós físicos:
descoberta por feed, negociação estruturada, reputação (avaliações), pagamento e entrega
guiados dentro do próprio app.

O nome carrega o conceito central: fechar o "loop" (ciclo) de vida de um produto — em vez
de descartar, ele volta a circular entre pessoas. Isso é o pilar de sustentabilidade e
economia circular do produto, não apenas um discurso de marca: cada venda concluída no
Kloop é, na prática, uma peça que deixou de virar lixo têxtil.

## Proposta de valor

| Para quem vende | Para quem compra |
|---|---|
| Monetiza itens parados em casa sem taxas fixas (plano gratuito existe) | Acesso a produtos seminovos com preço abaixo do novo |
| Ferramentas de negociação (ofertas, contra-propostas) em vez de "preço fixo, pechinche no chat" | Cashback em toda compra concluída (2%) |
| Cashback de 5% em toda venda concluída | Sistema de ofertas dá controle sobre o preço final |
| Plano pago (Kloop Pro) reduz comissão e dá mais impulsos de destaque | Reputação de vendedor visível antes de comprar (reviews) |
| Rota alternativa de consignação (Kloop Pro) para quem não quer fotografar/anunciar | Comunidades fecham a compra num raio de confiança (vizinhos) |

## Mercado-alvo

- **Geografia:** Brasil, mercado de moda/casa seminova — endereços com CEP e UF
  brasileiros são modelados nativamente (`Address.state` com 2 caracteres, `zipCode` no
  formato CEP).
- **Perfil primário:** pessoas físicas que já revendem informalmente (grupos de bairro,
  Instagram, WhatsApp) e querem uma ferramenta dedicada, com mais alcance e confiança do
  que uma DM.
- **Segmento secundário (B2B, Kloop Comunidades):** síndicos e moradores de condomínios
  residenciais que querem um "bazar permanente" fechado ao próprio prédio — reduz atrito
  de logística (entrega presencial, ninguém é estranho) e desconfiança de golpe.
- **Concorrência direta:** Enjoei (moda seminova, nacional), Repassa, OLX e Facebook
  Marketplace (generalistas, sem foco em moda nem em confiança de vizinhança), grupos de
  WhatsApp/Facebook de bairro (sem estrutura, sem reputação, sem pagamento).

## Diferenciais competitivos

1. **Negociação estruturada, não chat livre.** Ofertas têm preço, prazo de resposta
   (24h), limite de rodadas e um estado de "de quem é a vez" — elimina o "combinamos e o
   vendedor sumiu" que domina grupos de WhatsApp e Marketplace.
2. **Cashback nos dois lados da transação.** Vendedor ganha 5%, comprador ganha 2% em
   toda venda concluída — cria incentivo para transacionar dentro do app em vez de
   "fechar por fora" (prática comum em marketplaces sem esse mecanismo).
3. **Monetização em camadas, não só comissão.** A assinatura Kloop Pro dá ao vendedor
   recorrente um motivo para upgrade além de "vender mais rápido": anúncios ilimitados,
   mais impulsos semanais, comissão levemente menor (ver [08](08-revisao-negocio.md) para
   uma análise crítica de quão forte esse incentivo é de verdade).
4. **Kloop Pro (consignação).** Quem não quer fotografar/precificar/anunciar manda um
   lote físico; a Kloop cuida do resto e vende pela "Kloop Shop" — abre o mercado para
   quem tem volume de roupas mas não tempo (armários de brechó, mudanças, heranças).
5. **Vertical B2B (Kloop Comunidades).** Monetização fora do usuário final: condomínios
   como clientes institucionais, com regras próprias de moderação por comunidade
   (categoria bloqueada, preço máximo, aprovação de anúncio).

## Identidade visual

Paleta em tons de verde (do "Linen" claro de fundo até "Forest" quase preto), com o
"Teal/Airforce" (`#40916C`) como cor de call-to-action principal — reforça visualmente o
posicionamento de sustentabilidade/economia circular sem depender só do texto. Suporte
nativo a dark mode. Ver `src/app/globals.css` (`@theme`) para os tokens exatos.

## Stack técnica (resumo)

Next.js 15 (App Router) + React 19 + TypeScript estrito, PostgreSQL serverless (Neon) via
Prisma ORM 6, Auth.js (NextAuth v5) para login (Google OAuth + credenciais + verificação
de e-mail), Tailwind CSS v4, Cloudinary para imagens, Resend para e-mail transacional,
`qrcode` para o login por totem em condomínios. Deploy atual em Vercel (frontend) + Neon
(banco) — detalhado em [06-infraestrutura.md](06-infraestrutura.md).
