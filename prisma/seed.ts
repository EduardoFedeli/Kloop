import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed...')

  // 1. Garantir que os planos existam com as regras de negócio
  // Valores em centavos (ex: 2990 = R$ 29,90) e comissões decimais (0.08 = 8%)
  const planBasic = await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic' },
    update: {},
    create: {
      name: 'Kloop Basic',
      slug: 'basic',
      priceCents: 0,
      interval: 'MONTHLY',
      maxActiveListings: 20,
      commissionRate: 0.05, // 5% cashback/taxa, conforme sua UI
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

  // 2. Criar o 6º usuário para completar os pares
  const userExtra = await prisma.user.upsert({
    where: { email: 'visitante@kloop.com' },
    update: {},
    create: {
      name: 'João Visitante',
      email: 'visitante@kloop.com',
      emailVerified: new Date(),
      role: 'USER', // ou o enum que estiver no seu schema
    },
  })

  // 3. Mapear quem ganha qual plano
  // Eduardo e Gabriel -> Premium | Otavio e Caique -> Pro | Rodrigo e João -> Basic
  const userPlanMap = [
    { email: 'eduardo@kloop.com', planId: planPremium.id },
    { email: 'gabriel@kloop.com', planId: planPremium.id },
    { email: 'otavio@kloop.com', planId: planPro.id },
    { email: 'caique@kloop.com', planId: planPro.id },
    { email: 'rodrigo@kloop.com', planId: planBasic.id },
    { email: 'visitante@kloop.com', planId: planBasic.id },
  ]

  // 4. Buscar os usuários e atrelar a assinatura
  for (const mapping of userPlanMap) {
    const user = await prisma.user.findUnique({
      where: { email: mapping.email },
    })

    if (user) {
      // Inativa assinaturas antigas (se houver) para manter o histórico limpo
      await prisma.userSubscription.updateMany({
        where: { userId: user.id, status: 'ACTIVE' },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      })

      // Cria a nova assinatura ativa
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: mapping.planId,
          status: 'ACTIVE',
          currentPeriodStart: now, // <- Corrigido aqui (camelCase igual ao Prisma Schema)
          currentPeriodEnd: nextMonth, // <- Corrigido aqui (camelCase igual ao Prisma Schema)
        },
      })
      console.log(`✅ Plano atualizado para ${user.name} (${mapping.email})`)
    } else {
      console.warn(`⚠️ Usuário ${mapping.email} não encontrado no banco. Pulei.`)
    }
  }

  console.log('🚀 Seed de assinaturas finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })