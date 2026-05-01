import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { seedCategories } from './seed-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando o banco de dados...')
  
  // Limpeza de baixo pra cima nas relações para não dar erro de Foreign Key
  await prisma.cashbackTransaction.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.report.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.address.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Criando categorias...')
  await seedCategories(prisma)
  
  console.log('🔍 Buscando categorias para os produtos...')
  // Busca flexível em vez de slug engessado
  const catEletronicos = await prisma.category.findFirst({ where: { slug: { contains: 'smartphone' } } })
  const catCasa = await prisma.category.findFirst({ where: { slug: { contains: 'sofa' } } })
  const fallbackCat = await prisma.category.findFirst()

  const idEletronicos = catEletronicos?.id || fallbackCat?.id
  const idCasa = catCasa?.id || fallbackCat?.id

  if (!idEletronicos || !idCasa) {
    throw new Error('Erro crítico: Nenhuma categoria foi criada no banco.')
  }

  console.log('🌱 Criando usuários oficiais...')
  const hashedPassword = await bcrypt.hash('kloop123', 10)

  const members = [
    { name: 'Eduardo Fedeli', email: 'eduardo@kloop.com' },
    { name: 'Otavio Vitoriano', email: 'otavio@kloop.com' },
    { name: 'Caique Chagas', email: 'caique@kloop.com' },
    { name: 'Gabriel Torres', email: 'gabriel@kloop.com' },
    { name: 'Rodrigo Resende', email: 'rodrigo@kloop.com' },
  ]

  const users = []
  for (const m of members) {
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`,
        
        // 👇 ADICIONE ESSAS DUAS LINHAS AQUI 👇
        emailVerified: new Date(), 
        isVerified: true,
        // 👆 ------------------------------- 👆

        addresses: {
          create: {
            label: 'Casa',
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310100',
            isDefault: true
          }
        }
      }
    })
    users.push(user)
  }

  const [eduardo, otavio] = users

  console.log('🌱 Criando produtos de exemplo...')
  
  const products = [
    {
      sellerId: eduardo.id,
      title: 'iPhone 13 Pro Max 256GB',
      slug: 'iphone-13-pro-max-256gb',
      description: 'Aparelho impecável, sempre usado com capa e película. Saúde da bateria 88%. Acompanha caixa e cabo original.',
      priceCents: 450000,
      condition: 'LIKE_NEW' as const,
      status: 'ACTIVE' as const,
      brand: 'Apple',
      size: 'Único',
      categoryId: idEletronicos,
      images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800']
    },
    {
      sellerId: otavio.id,
      title: 'Sofá Minimalista Cinza',
      slug: 'sofa-minimalista-cinza',
      description: 'Sofá de 3 lugares, tecido linho, muito conservado. Motivo da venda: mudança.',
      priceCents: 120000,
      condition: 'GOOD' as const,
      status: 'ACTIVE' as const,
      brand: 'Tok&Stok',
      size: '2.10m',
      categoryId: idCasa,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800']
    }
  ]

  for (const p of products) {
    const { images, ...data } = p
    await prisma.listing.create({
      data: {
        ...data,
        images: {
          create: images.map((url, index) => ({
            url,
            displayOrder: index
          }))
        }
      }
    })
  }

  console.log('🌱 Populando Cashback para testes...')
  await prisma.cashbackTransaction.create({
    data: {
      userId: eduardo.id,
      amountCents: 5000, 
      type: 'CREDIT_BUYER',
      description: 'Bônus de boas-vindas Kloop'
    }
  })

  console.log('✅ Banco de dados populado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })