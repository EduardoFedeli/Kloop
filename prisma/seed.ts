import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando o banco de dados...')

  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.address.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Criando usuários oficiais do grupo...')
  const defaultPassword = await bcrypt.hash('kloop123', 10)
  const now = new Date()

  const groupMembers = [
    { name: 'Otavio Vitoriano', email: 'otavio@kloop.com.br' },
    { name: 'Caique Chagas', email: 'caique@kloop.com.br' },
    { name: 'Rodrigo Resende', email: 'rodrigo@kloop.com.br' },
    { name: 'Gabriel Torres', email: 'gabriel@kloop.com.br' },
    { name: 'Eduardo Fedeli', email: 'eduardo@kloop.com.br' },
    { name: 'Usuário Teste 1', email: 'teste1@kloop.com.br' },
    { name: 'Usuário Teste 2', email: 'teste2@kloop.com.br' },
  ]

  const createdUsers = []
  for (const member of groupMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: { name: member.name, password: defaultPassword, emailVerified: now },
      create: { name: member.name, email: member.email, password: defaultPassword, emailVerified: now },
    })
    createdUsers.push(user)
    console.log(`✅ Verificado/Criado: ${user.name}`)
  }

  const eduardo = createdUsers.find((u) => u.email === 'eduardo@kloop.com.br')!
  const otavio = createdUsers.find((u) => u.email === 'otavio@kloop.com.br')!
  const caique = createdUsers.find((u) => u.email === 'caique@kloop.com.br')!

  console.log('🏠 Criando endereços para usuários de teste...')

  // Eduardo — SP (CEP 01310-100) → frete regional vs MG/RJ
  await prisma.address.create({
    data: {
      userId: eduardo.id,
      label: 'Casa',
      street: 'Av. Paulista',
      number: '1578',
      complement: 'Apto 201',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: true,
    },
  })

  // Otavio — RJ (CEP 20040-020) → frete regional vs SP
  await prisma.address.create({
    data: {
      userId: otavio.id,
      label: 'Casa',
      street: 'Av. Rio Branco',
      number: '156',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-020',
      isDefault: true,
    },
  })

  // Caique — MG (CEP 30112-000) → frete regional vs SP
  await prisma.address.create({
    data: {
      userId: caique.id,
      label: 'Casa',
      street: 'Av. Afonso Pena',
      number: '800',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30112-000',
      isDefault: true,
    },
  })

  console.log('🌱 Criando categorias principais...')
  const categoriesData = [
    { name: 'Moças', slug: 'mocas', icon: '👗', subcats: ['Roupas', 'Calçados', 'Bolsas', 'Acessórios'] },
    { name: 'Rapazes', slug: 'rapazes', icon: '👕', subcats: ['Roupas', 'Calçados', 'Acessórios'] },
    { name: 'Crianças', slug: 'criancas', icon: '🧸', subcats: ['Meninas', 'Meninos', 'Bebês', 'Brinquedos'] },
    { name: 'Casa & Decor', slug: 'casa-e-decor', icon: '🛋️', subcats: ['Móveis', 'Decoração', 'Cama, Mesa e Banho'] },
    { name: 'Eletrônicos', slug: 'eletronicos', icon: '📱', subcats: ['Celulares', 'Informática', 'Áudio'] },
  ]

  const categoryMap = new Map<string, string>()

  for (const [index, dept] of categoriesData.entries()) {
    const parent = await prisma.category.create({
      data: { name: dept.name, slug: dept.slug, sortOrder: index },
    })
    categoryMap.set(dept.name.toLowerCase(), parent.id)

    for (const [subIndex, sub] of dept.subcats.entries()) {
      const child = await prisma.category.create({
        data: {
          name: sub,
          slug: `${dept.slug}-${sub.toLowerCase().replace(/\s+/g, '-')}`,
          parentId: parent.id,
          sortOrder: subIndex,
        },
      })
      categoryMap.set(sub.toLowerCase(), child.id)
    }
  }

  console.log('🌱 Injetando anúncios de teste...')

  await prisma.listing.create({
    data: {
      sellerId: eduardo.id,
      categoryId: categoryMap.get('calçados') || categoryMap.get('moças')!,
      title: 'Tênis Nike Air Max 90',
      slug: 'tenis-nike-air-max-90',
      description: 'Tênis original, usado poucas vezes. Acompanha caixa.',
      priceCents: 25000,
      condition: 'LIKE_NEW',
      status: 'ACTIVE',
      brand: 'Nike',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
            altText: 'Nike Air Max',
            displayOrder: 0,
          },
        ],
      },
    },
  })

  await prisma.listing.create({
    data: {
      sellerId: otavio.id,
      categoryId: categoryMap.get('roupas') || categoryMap.get('rapazes')!,
      title: 'Jaqueta de Couro Vintage',
      slug: 'jaqueta-couro-vintage',
      description: 'Jaqueta de couro legítimo, estilo biker. Perfeita para o inverno.',
      priceCents: 18000,
      condition: 'GOOD',
      status: 'ACTIVE',
      brand: 'Zara',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
            altText: 'Jaqueta Couro',
            displayOrder: 0,
          },
        ],
      },
    },
  })

  await prisma.listing.create({
    data: {
      sellerId: eduardo.id,
      categoryId: categoryMap.get('bolsas') || categoryMap.get('moças')!,
      title: 'Bolsa Schutz Crossbody',
      slug: 'bolsa-schutz-crossbody',
      description: 'Bolsa transversal Schutz, preta, tamanho médio.',
      priceCents: 32000,
      condition: 'NEW',
      status: 'ACTIVE',
      brand: 'Schutz',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800',
            altText: 'Bolsa Schutz',
            displayOrder: 0,
          },
        ],
      },
    },
  })

  console.log('✅ Banco de dados semeado com sucesso! Kloop está pronto.')
  console.log('📋 Usuários disponíveis (senha: kloop123):')
  console.log('   eduardo@kloop.com.br — vendedor (SP)')
  console.log('   otavio@kloop.com.br  — vendedor (RJ)')
  console.log('   caique@kloop.com.br  — comprador (MG)')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
