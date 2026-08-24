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
