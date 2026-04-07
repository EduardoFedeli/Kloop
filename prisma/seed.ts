import { PrismaClient, ListingCondition, ListingStatus } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

function slug(text: string): string {
  return slugify(text, { lower: true, strict: true })
}

async function main(): Promise<void> {
  // ──────────────────────────────────────────
  // Planos de assinatura
  // ──────────────────────────────────────────
  const planFree = await prisma.subscriptionPlan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      description: 'Comece a vender sem pagar nada.',
      priceCents: 0,
      maxActiveListings: 5,
      commissionRate: 0.08,
      features: { boosts: false, analytics: false, badge: false },
    },
  })

  const planPlus = await prisma.subscriptionPlan.upsert({
    where: { slug: 'plus' },
    update: {},
    create: {
      name: 'Plus',
      slug: 'plus',
      description: 'Para quem vende com frequência.',
      priceCents: 1490,
      maxActiveListings: 25,
      commissionRate: 0.03,
      features: { boosts: false, analytics: true, badge: true },
    },
  })

  const planPro = await prisma.subscriptionPlan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'Zero comissão, anúncios ilimitados.',
      priceCents: 3990,
      maxActiveListings: -1,
      commissionRate: 0.0,
      features: { boosts: true, analytics: true, badge: true, priority: true },
    },
  })

  console.log('✅ Planos criados:', planFree.name, planPlus.name, planPro.name)

  // ──────────────────────────────────────────
  // Categorias
  // ──────────────────────────────────────────
  const categoriesData = [
    { name: 'Roupas', icon: 'shirt', sortOrder: 1 },
    { name: 'Calçados', icon: 'footprints', sortOrder: 2 },
    { name: 'Acessórios', icon: 'watch', sortOrder: 3 },
    { name: 'Eletrônicos', icon: 'smartphone', sortOrder: 4 },
    { name: 'Casa', icon: 'sofa', sortOrder: 5 },
    { name: 'Outros', icon: 'package', sortOrder: 6 },
  ]

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: slug(cat.name) },
        update: {},
        create: {
          name: cat.name,
          slug: slug(cat.name),
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        },
      })
    )
  )

  console.log('✅ Categorias criadas:', categories.map((c) => c.name).join(', '))

  // ──────────────────────────────────────────
  // Usuários de teste
  // ──────────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { email: 'ana@thexgarage.test' },
    update: {},
    create: {
      name: 'Ana Lima',
      email: 'ana@thexgarage.test',
      phone: '11999990001',
      addresses: {
        create: {
          label: 'Casa',
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          isDefault: true,
        },
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'carlos@thexgarage.test' },
    update: {},
    create: {
      name: 'Carlos Souza',
      email: 'carlos@thexgarage.test',
      phone: '21999990002',
      addresses: {
        create: {
          label: 'Casa',
          street: 'Av. Atlântica',
          number: '456',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '22010-000',
          isDefault: true,
        },
      },
    },
  })

  console.log('✅ Usuários criados:', user1.name, user2.name)

  // ──────────────────────────────────────────
  // Listings com imagens placeholder
  // ──────────────────────────────────────────
  type ListingInput = {
    title: string
    description: string
    priceCents: number
    condition: ListingCondition
    categoryName: string
    sellerId: string
    brand?: string
    size?: string
    n: number
  }

  const listingsData: ListingInput[] = [
    {
      title: 'Vestido Floral Verão',
      description: 'Vestido floral levinho, perfeito para o verão. Usado apenas uma vez.',
      priceCents: 4500,
      condition: ListingCondition.LIKE_NEW,
      categoryName: 'Roupas',
      sellerId: user1.id,
      brand: 'Farm',
      size: 'M',
      n: 1,
    },
    {
      title: 'Jaqueta Jeans Oversized',
      description: 'Jaqueta jeans oversized vintage, estilo anos 90. Excelente estado.',
      priceCents: 8900,
      condition: ListingCondition.GOOD,
      categoryName: 'Roupas',
      sellerId: user2.id,
      brand: "Levi's",
      size: 'G',
      n: 2,
    },
    {
      title: 'Tênis Nike Air Max 90',
      description: 'Nike Air Max 90 branco, numeração 40. Pouco uso, sem marcas.',
      priceCents: 32000,
      condition: ListingCondition.LIKE_NEW,
      categoryName: 'Calçados',
      sellerId: user1.id,
      brand: 'Nike',
      size: '40',
      n: 3,
    },
    {
      title: 'Bolsa de Couro Marrom',
      description: 'Bolsa estruturada de couro legítimo, cor marrom. Alça ajustável.',
      priceCents: 15000,
      condition: ListingCondition.GOOD,
      categoryName: 'Acessórios',
      sellerId: user2.id,
      brand: 'Arezzo',
      n: 4,
    },
    {
      title: 'iPhone 13 128GB',
      description:
        'iPhone 13 128GB azul, excelente estado. Bateria em 92%. Acompanha caixa original.',
      priceCents: 280000,
      condition: ListingCondition.LIKE_NEW,
      categoryName: 'Eletrônicos',
      sellerId: user1.id,
      brand: 'Apple',
      n: 5,
    },
    {
      title: 'Fone Bluetooth Sony WH-1000XM4',
      description: 'Sony WH-1000XM4, cancelamento de ruído ativo. Perfeito estado com caixa.',
      priceCents: 120000,
      condition: ListingCondition.NEW,
      categoryName: 'Eletrônicos',
      sellerId: user2.id,
      brand: 'Sony',
      n: 6,
    },
    {
      title: 'Poltrona Retrô Mostarda',
      description: 'Poltrona de veludo cor mostarda, estilo retrô anos 70. Muito confortável.',
      priceCents: 45000,
      condition: ListingCondition.GOOD,
      categoryName: 'Casa',
      sellerId: user1.id,
      n: 7,
    },
    {
      title: 'Coleção Livros Harry Potter',
      description: 'Coleção completa 7 livros Harry Potter em português. Edição Rocco.',
      priceCents: 22000,
      condition: ListingCondition.FAIR,
      categoryName: 'Outros',
      sellerId: user2.id,
      brand: 'Rocco',
      n: 8,
    },
  ]

  const categoryMap = new Map(categories.map((c) => [c.name, c.id]))

  for (const data of listingsData) {
    const categoryId = categoryMap.get(data.categoryName)
    if (!categoryId) throw new Error(`Categoria não encontrada: ${data.categoryName}`)

    const listingSlug = `${slug(data.title)}-${data.n}`

    const listing = await prisma.listing.upsert({
      where: { slug: listingSlug },
      update: {
        title: data.title,
        description: data.description,
        priceCents: data.priceCents,
        condition: data.condition,
        brand: data.brand,
        size: data.size,
      },
      create: {
        title: data.title,
        slug: listingSlug,
        description: data.description,
        priceCents: data.priceCents,
        condition: data.condition,
        status: ListingStatus.ACTIVE,
        categoryId,
        sellerId: data.sellerId,
        brand: data.brand,
        size: data.size,
      },
    })

    // Garante que a imagem sempre use a URL correta
    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } })
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url: `https://picsum.photos/seed/thex${data.n}/400/400`,
        altText: data.title,
        displayOrder: 0,
      },
    })
  }

  console.log('✅ 8 listings criados com imagens placeholder')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
