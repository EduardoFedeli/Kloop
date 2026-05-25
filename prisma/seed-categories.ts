import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import slugify from 'slugify'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: 'pt' })
}

function formatCategoryName(text: string): string {
  if (!text) return ''
  const lowers = ['e', 'de', 'da', 'do', 'das', 'dos', 'para', 'com']
  return text.split(' ').map((word, index) => {
    const lowerWord = word.toLowerCase()
    if (lowers.includes(lowerWord) && index !== 0) return lowerWord
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1)
  }).join(' ')
}

async function cleanDatabase() {
  console.log('🧹 Limpando banco de dados...')

  await prisma.notification.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.listingCommunity.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.cashbackTransaction.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.review.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.brandFollow.deleteMany()
  await prisma.communityMember.deleteMany()
  await prisma.community.deleteMany()
  await prisma.userSubscription.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()

  console.log('✅ Banco limpo')
}

async function seedCategoriesFromCsv(): Promise<void> {
  const csvPath = path.join(process.cwd(), 'categorias.csv')
  let content = fs.readFileSync(csvPath, 'utf-8')

  content = content
    .replace(/casa e decor/gi, 'Casa e Decoração')
    .replace(/cama,mesa e banho/gi, '"Cama, Mesa e Banho"')
    .replace(/cama, berço e banho/gi, '"Cama, Berço e Banho"')
    .replace(/cd's, dvd's e fitas/gi, '"CDs, DVDs e Fitas"')
    .replace(/"figurinhas, selos e cartções"/gi, '"Figurinhas, Selos e Cartões"')

  const rawRows = parse(content, {
    delimiter: ',',
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as string[][]

  const dataRows = rawRows.filter((r) => r[0].toLowerCase() !== 'departamento')

  const slugToId = new Map<string, string>()
  const sortCounters = new Map<string, number>()

  function nextSort(parentKey: string): number {
    const n = sortCounters.get(parentKey) ?? 0
    sortCounters.set(parentKey, n + 1)
    return n
  }

  async function upsertNode(name: string, slug: string, parentId: string | null, sortOrder: number): Promise<string> {
    if (slugToId.has(slug)) return slugToId.get(slug)!
    const node = await prisma.category.upsert({
      where: { slug },
      update: { name, parentId, sortOrder },
      create: { name, slug, parentId, sortOrder },
    })
    slugToId.set(slug, node.id)
    return node.id
  }

  for (const row of dataRows) {
    const cols = row.filter((col) => col.trim() !== '')
    const deptName = formatCategoryName(cols[0])
    const catName = formatCategoryName(cols[1])
    const subName = formatCategoryName(cols[2])
    const charName = formatCategoryName(cols[3])

    if (!deptName || !catName) continue

    const deptSlug = toSlug(deptName)
    const deptId = await upsertNode(deptName, deptSlug, null, nextSort('root'))

    const catSlug = `${deptSlug}-${toSlug(catName)}`
    const catId = await upsertNode(catName, catSlug, deptId, nextSort(deptSlug))

    if (!subName) continue

    const subSlug = `${catSlug}-${toSlug(subName)}`
    const subId = await upsertNode(subName, subSlug, catId, nextSort(catSlug))

    if (!charName) continue

    const charSlug = `${subSlug}-${toSlug(charName)}`
    await upsertNode(charName, charSlug, subId, nextSort(subSlug))
  }

  console.log(`✅ Categorias: ${slugToId.size} nós criados`)
}

async function seedPlans() {
  console.log('💳 Criando planos de assinatura...')

  const basic = await prisma.subscriptionPlan.upsert({
    where: { slug: 'basic' },
    update: { commissionRate: 0.10 },
    create: {
      name: 'Kloop Basic', slug: 'basic', priceCents: 0, interval: 'MONTHLY',
      maxActiveListings: 20, commissionRate: 0.10,
      features: { cashbackVendas: '3%', cashbackCompras: '2%' }, isActive: true,
    },
  })

  const pro = await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    update: { commissionRate: 0.05 },
    create: {
      name: 'Kloop Pro', slug: 'pro', priceCents: 2990, interval: 'MONTHLY',
      maxActiveListings: 40, commissionRate: 0.05,
      features: { cashbackVendas: '3%', cashbackCompras: '2%' }, isActive: true,
    },
  })

  const premium = await prisma.subscriptionPlan.upsert({
    where: { slug: 'premium' },
    update: { commissionRate: 0.03 },
    create: {
      name: 'Kloop Premium', slug: 'premium', priceCents: 5990, interval: 'MONTHLY',
      maxActiveListings: 60, commissionRate: 0.03,
      features: { cashbackVendas: '3%', cashbackCompras: '2%', megafone: 10 }, isActive: true,
    },
  })

  console.log('✅ Planos criados')
  return { basic, pro, premium }
}

async function seedUsers(senha: string, plans: { basic: { id: string }; pro: { id: string }; premium: { id: string } }) {
  console.log('👤 Criando usuários seed...')

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

  const userDefs = [
    { name: 'Eduardo Fedeli', email: 'eduardo@kloop.com', planId: plans.premium.id },
    { name: 'Gabriel',        email: 'gabriel@kloop.com',  planId: plans.premium.id },
    { name: 'Otávio',         email: 'otavio@kloop.com',   planId: plans.pro.id },
    { name: 'Caique',         email: 'caique@kloop.com',   planId: plans.pro.id },
    { name: 'Rodrigo',        email: 'rodrigo@kloop.com',  planId: plans.basic.id },
    { name: 'João Visitante', email: 'visitante@kloop.com', planId: plans.basic.id },
  ]

  const created: { id: string; email: string }[] = []

  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { emailVerified: new Date(), password: senha },
      create: { name: u.name, email: u.email, password: senha, emailVerified: new Date(), role: 'USER' },
    })
    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: { planId: u.planId, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: nextMonth },
      create: { userId: user.id, planId: u.planId, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: nextMonth },
    })
    created.push({ id: user.id, email: user.email })
    console.log(`  ✅ ${u.email}`)
  }

  return created
}

async function seedCommunities(primaryUserId: string, allUsers: { id: string; email: string }[]) {
  console.log('🏘️  Criando comunidades...')

  const comunidadeJardim = await prisma.community.upsert({
    where: { slug: 'jardim-das-flores' },
    update: {},
    create: {
      name: 'Residencial Jardim das Flores', slug: 'jardim-das-flores',
      description: 'Comunidade exclusiva dos moradores do Residencial Jardim das Flores.',
      adminUserId: primaryUserId, isActive: true, maxMembers: 200,
    },
  })

  const comunidadeVila = await prisma.community.upsert({
    where: { slug: 'vila-verde' },
    update: {},
    create: {
      name: 'Condomínio Vila Verde', slug: 'vila-verde',
      description: 'Espaço de desapego dos moradores do Condomínio Vila Verde.',
      adminUserId: primaryUserId, isActive: true, maxMembers: 350,
    },
  })

  const membershipMap: Record<string, { jardim: string | null; vila: string | null }> = {
    'eduardo@kloop.com': { jardim: 'Apto 102', vila: 'Bloco B - 304' },
    'gabriel@kloop.com': { jardim: 'Apto 304', vila: null },
    'otavio@kloop.com':  { jardim: 'Apto 1201', vila: 'Bloco A - 101' },
    'caique@kloop.com':  { jardim: null, vila: 'Bloco C - 502' },
    'rodrigo@kloop.com': { jardim: 'Apto 504', vila: 'Bloco D - 203' },
  }

  for (const u of allUsers) {
    const m = membershipMap[u.email]
    if (!m) continue
    const isAdmin = u.email === 'eduardo@kloop.com'

    if (m.jardim) {
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: comunidadeJardim.id, userId: u.id } },
        update: {},
        create: { communityId: comunidadeJardim.id, userId: u.id, role: isAdmin ? 'ADMIN' : 'MEMBER', status: 'ACTIVE', unitNumber: m.jardim },
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

  console.log('✅ Comunidades e memberships criados')
}

async function main() {
  console.log('🌱 seed:categories — iniciando...\n')

  await cleanDatabase()

  console.log('\n📂 Importando árvore de categorias...')
  await seedCategoriesFromCsv()

  console.log('\n💳 Configurando planos...')
  const plans = await seedPlans()

  const senha = await bcrypt.hash('kloop123', 10)
  console.log('\n👤 Criando usuários...')
  const users = await seedUsers(senha, plans)

  const primaryUser = users.find(u => u.email === 'eduardo@kloop.com')!
  console.log('\n🏘️  Criando comunidades...')
  await seedCommunities(primaryUser.id, users)

  console.log('\n🎉 seed:categories concluído!')
  console.log('   Senha de todos os usuários: kloop123')
  console.log('   Usuários: eduardo, gabriel, otavio, caique, rodrigo, visitante @kloop.com')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
