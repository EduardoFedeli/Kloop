import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USERS = [
  { name: 'Ana Souza',        email: 'ana@kloop.com',      gender: 'FEMININE' },
  { name: 'Beatriz Lima',     email: 'beatriz@kloop.com',  gender: 'FEMININE' },
  { name: 'Camila Ferreira',  email: 'camila@kloop.com',   gender: 'FEMININE' },
  { name: 'Daniela Costa',    email: 'daniela@kloop.com',  gender: 'FEMININE' },
  { name: 'Fernanda Rocha',   email: 'fernanda@kloop.com', gender: 'FEMININE' },
  { name: 'Gabriel Mendes',   email: 'gabriel@kloop.com',  gender: 'MASCULINE' },
  { name: 'Henrique Alves',   email: 'henrique@kloop.com', gender: 'MASCULINE' },
  { name: 'Igor Batista',     email: 'igor@kloop.com',     gender: 'MASCULINE' },
  { name: 'João Carvalho',    email: 'joao@kloop.com',     gender: 'MASCULINE' },
  { name: 'Larissa Nunes',    email: 'larissa@kloop.com',  gender: 'FEMININE' },
  { name: 'Mariana Pinto',    email: 'mariana@kloop.com',  gender: 'FEMININE' },
  { name: 'Nicolas Gomes',    email: 'nicolas@kloop.com',  gender: 'MASCULINE' },
  { name: 'Otávio Reis',      email: 'otavio@kloop.com',   gender: 'MASCULINE' },
  { name: 'Patricia Dias',    email: 'patricia@kloop.com', gender: 'FEMININE' },
  { name: 'Rafael Silva',     email: 'rafael@kloop.com',   gender: 'MASCULINE' },
]

const COMMUNITIES = [
  {
    name: 'Condomínio Vila Nova',
    slug: 'condominio-vila-nova',
    description: 'Comunidade exclusiva para os moradores do Condomínio Vila Nova.',
    memberIndexes: [0, 1, 2, 5, 6, 9, 10],
  },
  {
    name: 'Clube Atlético Jardins',
    slug: 'clube-atletico-jardins',
    description: 'Espaço de desapego para os associados do Clube Atlético Jardins.',
    memberIndexes: [3, 4, 7, 8, 11, 12],
  },
  {
    name: 'Residencial Green Park',
    slug: 'residencial-green-park',
    description: 'Comunidade dos moradores do Residencial Green Park.',
    memberIndexes: [2, 5, 9, 13, 14, 0],
  },
]

async function main() {
  const hash = await bcrypt.hash('kloop123', 10)

  console.log('👤 Criando 15 usuários...')
  const createdUsers: { id: string; index: number }[] = []

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i]
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        emailVerified: new Date(),
        password: hash,
        genderPreference: u.gender as 'FEMININE' | 'MASCULINE',
        avatarUrl: null,
      },
    })
    createdUsers.push({ id: user.id, index: i })
    console.log(`  ✅ ${u.name} (${u.email})`)
  }

  console.log('\n🏘️  Criando 3 comunidades...')

  for (const com of COMMUNITIES) {
    const adminUser = createdUsers.find(u => u.index === com.memberIndexes[0])!

    const community = await prisma.community.upsert({
      where: { slug: com.slug },
      update: {},
      create: {
        name: com.name,
        slug: com.slug,
        description: com.description,
        adminUserId: adminUser.id,
      },
    })

    console.log(`  🏘️  ${com.name}`)
    console.log(`     → totem: /totem/${com.slug}`)

    for (const idx of com.memberIndexes) {
      const user = createdUsers.find(u => u.index === idx)
      if (!user) continue
      await prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: community.id, userId: user.id } },
        update: {},
        create: {
          communityId: community.id,
          userId: user.id,
          status: 'ACTIVE',
        },
      })
    }

    console.log(`     → ${com.memberIndexes.length} membros adicionados`)
  }

  console.log('\n✅ Seed concluído!')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
