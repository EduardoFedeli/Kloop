import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed...')

  // 1. Garantir que os planos existam com as regras de negócio
  const planBasic = await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic' },
    update: {},
    create: {
      name: 'Kloop Basic',
      slug: 'basic',
      priceCents: 0,
      interval: 'MONTHLY',
      maxActiveListings: 20,
      commissionRate: 0.05,
      features: { cashbackVendas: '5%', cashbackCompras: '2%' },
      isActive: true,
    },
  })

  const planPro = await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Kloop Pro',
      slug: 'pro',
      priceCents: 2990,
      interval: 'MONTHLY',
      maxActiveListings: 40,
      commissionRate: 0.08,
      features: { cashbackVendas: '8%', cashbackCompras: '4%' },
      isActive: true,
    },
  })

  const planPremium = await prisma.subscriptionPlan.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      name: 'Kloop Premium',
      slug: 'premium',
      priceCents: 5990,
      interval: 'MONTHLY',
      maxActiveListings: 60,
      commissionRate: 0.08,
      features: { cashbackVendas: '8%', cashbackCompras: '4%', megafone: 10 },
      isActive: true,
    },
  })

  // 2. Criar usuário extra se não existir
  await prisma.user.upsert({
    where: { email: 'visitante@kloop.com' },
    update: {},
    create: {
      name: 'João Visitante',
      email: 'visitante@kloop.com',
      emailVerified: new Date(),
      role: 'USER',
    },
  })

  // 3. Mapear planos por usuário
  const userPlanMap = [
    { email: 'eduardo@kloop.com', planId: planPremium.id },
    { email: 'gabriel@kloop.com', planId: planPremium.id },
    { email: 'otavio@kloop.com', planId: planPro.id },
    { email: 'caique@kloop.com', planId: planPro.id },
    { email: 'rodrigo@kloop.com', planId: planBasic.id },
    { email: 'visitante@kloop.com', planId: planBasic.id },
  ]

  // 4. Atrelar assinaturas (upsert para ser idempotente)
  for (const mapping of userPlanMap) {
    const user = await prisma.user.findUnique({ where: { email: mapping.email } })
    if (user) {
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      const existing = await prisma.userSubscription.findUnique({ where: { userId: user.id } })
      if (existing) {
        await prisma.userSubscription.update({
          where: { userId: user.id },
          data: { planId: mapping.planId, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: nextMonth, cancelledAt: null },
        })
      } else {
        await prisma.userSubscription.create({
          data: { userId: user.id, planId: mapping.planId, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: nextMonth },
        })
      }
      console.log(`✅ Plano atualizado para ${user.name} (${mapping.email})`)
    } else {
      console.warn(`⚠️ Usuário ${mapping.email} não encontrado. Pulei.`)
    }
  }

  console.log('🚀 Seed de assinaturas finalizado!')

  // ─────────────────────────────────────────────────────────────────────────
  // COMUNIDADES B2B — Seed de demonstração para MVP
  // ─────────────────────────────────────────────────────────────────────────

  console.log('🏘️  Iniciando seed de comunidades...')

  const primaryUser = await prisma.user.findUnique({ where: { email: 'eduardo@kloop.com' } })
  if (!primaryUser) {
    console.warn('⚠️ Usuário primário (eduardo@kloop.com) não encontrado. Pulando seed de comunidades.')
    return
  }

  // Upsert das 2 comunidades (admin = usuário primário)
  const comunidadeJardim = await prisma.community.upsert({
    where: { slug: 'jardim-das-flores' },
    update: {},
    create: {
      name: 'Residencial Jardim das Flores',
      slug: 'jardim-das-flores',
      description:
        'Comunidade exclusiva dos moradores do Residencial Jardim das Flores. Torre A (20 andares) e Torre B (18 andares). Compre e venda com segurança entre vizinhos.',
      adminUserId: primaryUser.id,
      isActive: true,
      maxMembers: 200,
    },
  })

  const comunidadeVila = await prisma.community.upsert({
    where: { slug: 'vila-verde' },
    update: {},
    create: {
      name: 'Condomínio Vila Verde',
      slug: 'vila-verde',
      description:
        'Espaço de desapego dos moradores do Condomínio Vila Verde. 4 blocos, 350 unidades. Priorize seus vizinhos antes de vender para fora do condomínio.',
      adminUserId: primaryUser.id,
      isActive: true,
      maxMembers: 350,
    },
  })

  console.log('✅ Comunidades criadas/verificadas')

  // Membership do usuário primário em ambas
  await prisma.communityMember.upsert({
    where: { communityId_userId: { communityId: comunidadeJardim.id, userId: primaryUser.id } },
    update: {},
    create: {
      communityId: comunidadeJardim.id,
      userId: primaryUser.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      unitNumber: 'Apto 102',
    },
  })

  await prisma.communityMember.upsert({
    where: { communityId_userId: { communityId: comunidadeVila.id, userId: primaryUser.id } },
    update: {},
    create: {
      communityId: comunidadeVila.id,
      userId: primaryUser.id,
      role: 'MEMBER',
      status: 'ACTIVE',
      unitNumber: 'Bloco B - 304',
    },
  })

  // Memberships dos outros usuários
  const otherMemberships = [
    { email: 'gabriel@kloop.com', jardim: 'Apto 304', vila: null },
    { email: 'otavio@kloop.com', jardim: 'Apto 1201', vila: 'Bloco A - 101' },
    { email: 'caique@kloop.com', jardim: null, vila: 'Bloco C - 502' },
    { email: 'rodrigo@kloop.com', jardim: 'Apto 504', vila: 'Bloco D - 203' },
  ]

  for (const m of otherMemberships) {
    const u = await prisma.user.findUnique({ where: { email: m.email } })
    if (!u) continue
    if (m.jardim) {
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: comunidadeJardim.id, userId: u.id } },
        update: {},
        create: { communityId: comunidadeJardim.id, userId: u.id, role: 'MEMBER', status: 'ACTIVE', unitNumber: m.jardim },
      })
    }
    if (m.vila) {
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: comunidadeVila.id, userId: u.id } },
        update: {},
        create: { communityId: comunidadeVila.id, userId: u.id, role: 'MEMBER', status: 'ACTIVE', unitNumber: m.vila },
      })
    }
  }

  console.log('✅ Memberships criados')

  // Buscar categoria folha para os listings
  const leafCategory = await prisma.category.findFirst({
    where: { children: { none: {} } },
    select: { id: true },
  })
  if (!leafCategory) {
    console.warn('⚠️ Nenhuma categoria folha. Pulando listings de comunidade.')
    return
  }

  // Helpers idempotentes
  async function upsertSeedListing(
    slug: string,
    sellerId: string,
    title: string,
    description: string,
    priceCents: number,
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR',
  ) {
    return prisma.listing.upsert({
      where: { slug },
      update: {},
      create: {
        sellerId,
        categoryId: leafCategory!.id,
        title,
        slug,
        description,
        priceCents,
        condition,
        status: 'ACTIVE',
        acceptsOffers: true,
        smartPriceEnabled: false,
      },
    })
  }

  async function linkListingToCommunity(listingId: string, communityId: string) {
    const exists = await prisma.listingCommunity.findUnique({
      where: { listingId_communityId: { listingId, communityId } },
    })
    if (!exists) {
      await prisma.listingCommunity.create({ data: { listingId, communityId } })
    }
  }

  // Buscar usuários dos outros membros
  const [gabriel, otavio, caique, rodrigo] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'gabriel@kloop.com' } }),
    prisma.user.findUnique({ where: { email: 'otavio@kloop.com' } }),
    prisma.user.findUnique({ where: { email: 'caique@kloop.com' } }),
    prisma.user.findUnique({ where: { email: 'rodrigo@kloop.com' } }),
  ])

  // 3 listings para jardim-das-flores
  if (gabriel) {
    const l = await upsertSeedListing(
      'seed-jardim-jaqueta-couro',
      gabriel.id,
      'Jaqueta de Couro Vintage',
      'Jaqueta vintage anos 90, couro legítimo, em ótimo estado. Pouco uso, sem avarias.',
      28000,
      'LIKE_NEW',
    )
    await linkListingToCommunity(l.id, comunidadeJardim.id)
  }
  if (otavio) {
    const l = await upsertSeedListing(
      'seed-jardim-tenis-nike',
      otavio.id,
      'Tênis Nike Air Force 1',
      'Tênis Nike original, número 42, branco, usado por 3 meses. Conservadíssimo.',
      18000,
      'GOOD',
    )
    await linkListingToCommunity(l.id, comunidadeJardim.id)
  }
  if (rodrigo) {
    const l = await upsertSeedListing(
      'seed-jardim-livro-clean-code',
      rodrigo.id,
      'Livro Clean Code - Robert C. Martin',
      'Livro em perfeito estado, lido uma vez. Capa dura. Ideal para devs.',
      5500,
      'LIKE_NEW',
    )
    await linkListingToCommunity(l.id, comunidadeJardim.id)
  }

  console.log('✅ Listings do jardim-das-flores criados')

  // 4 listings para vila-verde
  if (caique) {
    const l1 = await upsertSeedListing(
      'seed-vila-mesa-madeira',
      caique.id,
      'Mesa de Madeira Maciça 4 Lugares',
      'Mesa de jantar em madeira maciça, 4 lugares. Mudança de apartamento, precisa sair logo.',
      120000,
      'GOOD',
    )
    await linkListingToCommunity(l1.id, comunidadeVila.id)

    const l2 = await upsertSeedListing(
      'seed-vila-luminaria',
      caique.id,
      'Luminária de Piso Vintage',
      'Luminária de piso estilo vintage, funcionando perfeitamente. Base de ferro e cúpula de tecido bege.',
      25000,
      'LIKE_NEW',
    )
    await linkListingToCommunity(l2.id, comunidadeVila.id)
  }
  if (gabriel) {
    const l = await upsertSeedListing(
      'seed-vila-bicicleta',
      gabriel.id,
      'Bicicleta Caloi Urbana Aro 26',
      'Bicicleta urbana com 21 marchas, cesta, farol e bagageiro. Revisada há 2 meses.',
      85000,
      'GOOD',
    )
    await linkListingToCommunity(l.id, comunidadeVila.id)
  }
  if (rodrigo) {
    const l = await upsertSeedListing(
      'seed-vila-cafeteira',
      rodrigo.id,
      'Cafeteira Nespresso Essenza Mini',
      'Cafeteira Nespresso seminova, acompanha 10 cápsulas. Cor preta, 220V.',
      32000,
      'LIKE_NEW',
    )
    await linkListingToCommunity(l.id, comunidadeVila.id)
  }

  console.log('✅ Listings do vila-verde criados')

  // 1 listing do usuário primário em AMBAS as comunidades (demonstra N:N)
  const listingDuplo = await upsertSeedListing(
    'seed-duplo-armario-branco',
    primaryUser.id,
    'Armário 3 Portas Branco',
    'Armário branco de 3 portas, em ótimo estado. Entrego somente no condomínio por conta própria.',
    95000,
    'GOOD',
  )
  await linkListingToCommunity(listingDuplo.id, comunidadeJardim.id)
  await linkListingToCommunity(listingDuplo.id, comunidadeVila.id)

  console.log('✅ Listing N:N (em ambas as comunidades) criado')
  console.log('🎉 Seed de comunidades finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
