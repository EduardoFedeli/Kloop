# 06 — Infraestrutura

## Arquitetura atual (produção hoje)

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────────┐
│   Usuário    │─────▶│  Vercel (Next.js) │─────▶│  Neon (PostgreSQL   │
│  (navegador) │      │  frontend + API   │      │  serverless)        │
└─────────────┘      │  routes + SSR      │      └────────────────────┘
                       └────────┬──────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              Cloudinary    Resend    Google OAuth
              (imagens)   (e-mail)    (login social)
```

- **Vercel** hospeda o Next.js inteiro (frontend + Route Handlers/API + Server Actions),
  com deploy automático a cada push, edge network global, HTTPS e CDN por padrão.
- **Neon** é PostgreSQL serverless — escala (e "desliga") sozinho conforme uso, com uma
  conexão direta (`DIRECT_URL`) reservada para rodar migrations do Prisma.
- **Cloudinary** guarda as imagens de anúncios/perfil (upload em `POST /api/upload/image`).
- **Resend** envia e-mails transacionais (verificação de conta).
- **Auth.js (NextAuth)** cuida de sessão via JWT, sem servidor de sessão dedicado.

### Por que essa escolha faz sentido para o estágio atual

Custo praticamente zero em baixo tráfego (ambos têm tier gratuito generoso), zero
DevOps (sem servidor para atualizar, sem patch de SO, sem configurar TLS), deploy em
minutos, e escala automática se o tráfego crescer de repente (ex.: pico de acesso no dia
da apresentação do TCC). Para um MVP/TCC, é a escolha certa: tempo de time é o recurso
mais escasso, não custo de infraestrutura.

### Limitações do modelo atual, para quando o produto crescer

- **Cold starts** — funções serverless "dormem" sem tráfego e demoram um pouco para
  "acordar" na primeira requisição.
- **Custo por uso** pode ficar imprevisível/caro em escala alta (milhões de requisições,
  muitas conexões simultâneas de banco).
- **Menos controle** sobre tuning fino de banco (índices avançados, extensões
  específicas, réplicas de leitura customizadas) do que num Postgres autogerenciado.
- **Vendor lock-in** relativo — migrar de Vercel/Neon depois de crescer o produto exige
  planejamento.

## Monólito vs. microsserviços: por que Comunidades não é um sistema separado

> Registrado em 2026-08 depois de uma pergunta interna do time: "o jeito que Comunidades
> foi implementado — só mais uma tabela no mesmo banco, gerenciada pelo mesmo app — não é
> preguiça? Se tivéssemos mais tempo, não deveria ser um sistema à parte, conversando com
> o app principal por API, com banco próprio?" A resposta curta: não, e a Kloop deve
> continuar assim por enquanto — de propósito, não por falta de tempo.

**O princípio, que não é opinião nossa, é prática estabelecida de arquitetura:** comece
monolítico, separe só quando alguma pressão real obrigar a separar. Cada sistema separado
que "conversa" com outro via API custa caro — mais um ponto de falha, mais latência, mais
complexidade de deploy, risco real de dado ficar inconsistente entre os dois lados
(transação distribuída é um problema difícil de verdade). Empresas grandes (Shopify é o
exemplo mais citado) ficam monolíticas por anos de propósito, e só separam quando a dor de
não separar fica maior que o custo de separar.

**Aplicando isso a Comunidades, especificamente:**

- **"Precisaríamos de um banco por condomínio"?** Não — isso seria, na real, um passo
  pra trás. "Banco por tenant" é um padrão real, mas resolve um problema que a Kloop não
  tem: isolamento de dado por exigência contratual/regulatória. Sem essa exigência, é
  pior que a alternativa: rodar migration em centenas de bancos a cada mudança de schema,
  não conseguir cruzar dados entre comunidades pra relatório, multiplicar custo de
  conexão. O padrão certo — que já é o implementado — é uma tabela `Community` com FK em
  `CommunityMember`/`Listing`, isolando por linha. É como a maioria dos SaaS B2B do mundo
  (Stripe incluso) faz multi-tenancy em escala.
- **"Precisaríamos de uma API entre os dois sistemas"?** Só faria sentido se fossem dois
  sistemas de verdade. E, de fato, **onde essa fronteira é real, ela já existe**: o totem
  físico do condomínio já conversa com o app via API (`/api/totem/*`) — porque o totem é
  literalmente um dispositivo separado, isso é uma fronteira genuína. Criar uma API
  interna entre "o app" e "o módulo de comunidades" quando os dois rodam no mesmo
  processo e banco seria burocracia sem benefício.

**Os gatilhos que justificariam reconsiderar** (nenhum presente hoje):
1. Um cliente exigir isolamento de dado por contrato (ex.: uma administradora grande que
   exige banco próprio como cláusula).
2. A base de comunidades crescer a ponto de precisar de time e ciclo de deploy próprios,
   independentes do resto do produto.
3. Precisar integrar com software de gestão de condomínio de terceiros (SuperLógica,
   Housy, etc.) — aí sim, uma camada de API/integração faria sentido, mas seria uma API
   **entre Kloop e o sistema externo**, não entre duas partes internas do Kloop.
4. A frota de totens físicos crescer o bastante pra justificar um serviço dedicado de
   gestão de dispositivo (provisionamento remoto, atualização de firmware, autenticação
   de hardware) — esse é o único ponto onde separar tem lógica técnica hoje, e mesmo
   assim só quando a frota justificar.

**Resposta pronta pra banca técnica** (ver também [09-comunidades.md](09-comunidades.md)
e [07-perguntas-banca.md](07-perguntas-banca.md)):

> "Avaliamos separar Comunidades num sistema à parte e decidimos conscientemente não
> fazer isso agora, porque não existe pressão técnica real que justifique — sem times
> separados, sem necessidade de escalar independente, sem exigência de isolamento de
> dado por cliente. Separar cedo demais é um erro de arquitetura tão real quanto não
> separar quando necessário. Sabemos exatamente qual seria o gatilho pra reconsiderar."

## Proposta de evolução (roadmap futuro, não é o estado atual)

> Importante para a banca: isso é uma **proposta de arquitetura futura**, não uma
> migração em andamento. O Kloop roda hoje inteiramente em Vercel + Neon.

Quando o tráfego e o time justificarem operar infraestrutura própria (ex.: custo
serverless mensal supera o de servidores dedicados, ou o produto precisa de controle mais
fino sobre o banco), uma evolução natural é migrar para servidores dedicados — por
exemplo, duas instâncias EC2 (AWS) com responsabilidades separadas:

```
┌──────────────┐      ┌───────────────────────┐      ┌─────────────────────────┐
│   Usuário     │─────▶│  Load Balancer (ALB)   │─────▶│  EC2 #1 — Aplicação      │
│  (navegador)  │      │  + CDN (CloudFront)     │      │  Next.js (Node.js)       │
└──────────────┘      └───────────────────────┘      │  atrás de PM2/Docker      │
                                                          └────────────┬─────────────┘
                                                                       │  conexão privada
                                                                       │  (VPC interna)
                                                          ┌────────────▼─────────────┐
                                                          │  EC2 #2 — Banco de dados  │
                                                          │  PostgreSQL dedicado      │
                                                          │  (ou RDS gerenciado)      │
                                                          └───────────────────────────┘
```

### Por que separar em duas instâncias

- **Isolamento de recursos** — um pico de CPU na aplicação (renderização, uploads) não
  compete por memória/IO com o banco.
- **Segurança** — o banco fica numa subnet privada da VPC, sem IP público, acessível só
  pela instância de aplicação.
- **Escala independente** — dá para aumentar a instância da aplicação (mais tráfego web)
  sem precisar redimensionar o banco, e vice-versa.

### Trade-offs de ir para EC2 (ser honesto com a banca)

| | Vercel + Neon (atual) | EC2 dedicado (proposta futura) |
|---|---|---|
| Custo em baixo tráfego | Muito baixo/gratuito | Custo fixo mensal mesmo sem uso |
| Custo em alto tráfego previsível | Pode ficar caro por uso | Mais previsível/barato em volume |
| Operação | Zero DevOps | Precisa de alguém cuidando de SO, patches, backup, monitoramento |
| Deploy | Automático a cada push | Precisa de pipeline próprio (CI/CD, ex. GitHub Actions + SSH/Docker) |
| Escala | Automática | Manual ou com Auto Scaling Group (mais configuração) |

### Recomendação

**Não migrar agora.** Vercel + Neon é a escolha certa enquanto o produto está em
validação (MVP/TCC, poucos usuários reais). A migração para EC2 (ou similar — a mesma
lógica vale para DigitalOcean, Hetzner, GCP Compute Engine) só compensa quando houver
tráfego consistente o suficiente para o custo serverless superar o custo fixo de servidor
dedicado, **e** o time tiver capacidade de assumir a operação (backup, monitoramento,
segurança) que hoje a Vercel/Neon fazem de graça. Um meio-termo intermediário antes de
EC2 puro seria trocar só o banco para um Postgres gerenciado com preço mais previsível
(ex. RDS ou um droplet dedicado), mantendo a aplicação na Vercel — reduz o maior risco de
custo (banco em escala) sem abrir mão do deploy automático da aplicação.

## Outras peças de infraestrutura já em uso

- **Cloudinary** — continuaria fazendo sentido mesmo após migrar para EC2 (CDN de imagens
  dedicado é melhor que servir imagem estática do próprio servidor de aplicação).
- **Resend** — mesma lógica: e-mail transacional é melhor delegado a um serviço
  especializado do que rodado em servidor próprio (deliverability, SPF/DKIM).
- **Variáveis de ambiente sensíveis** (`.env`) — nunca commitadas, conforme regra do
  projeto; numa migração para EC2, precisariam ser geridas via AWS Secrets Manager ou
  Parameter Store em vez de arquivo `.env` solto no servidor.
