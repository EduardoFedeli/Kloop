import { PrismaClient, ListingCondition, ListingStatus } from '@prisma/client'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

const FEMALE_USERS = [
  { name: 'Ana Luiza Ferreira',   email: 'ana.luiza@seed-realistic.kloop' },
  { name: 'Beatriz Santos',       email: 'beatriz.santos@seed-realistic.kloop' },
  { name: 'Camila Oliveira',      email: 'camila.oliveira@seed-realistic.kloop' },
  { name: 'Daniela Rodrigues',    email: 'daniela.rodrigues@seed-realistic.kloop' },
  { name: 'Fernanda Lima',        email: 'fernanda.lima@seed-realistic.kloop' },
  { name: 'Gabriela Costa',       email: 'gabriela.costa@seed-realistic.kloop' },
  { name: 'Helena Martins',       email: 'helena.martins@seed-realistic.kloop' },
  { name: 'Isabella Pereira',     email: 'isabella.pereira@seed-realistic.kloop' },
  { name: 'Juliana Alves',        email: 'juliana.alves@seed-realistic.kloop' },
  { name: 'Larissa Souza',        email: 'larissa.souza@seed-realistic.kloop' },
  { name: 'Mariana Gomes',        email: 'mariana.gomes@seed-realistic.kloop' },
  { name: 'Natalia Carvalho',     email: 'natalia.carvalho@seed-realistic.kloop' },
  { name: 'Patricia Ribeiro',     email: 'patricia.ribeiro@seed-realistic.kloop' },
  { name: 'Rafaela Nascimento',   email: 'rafaela.nascimento@seed-realistic.kloop' },
  { name: 'Sabrina Torres',       email: 'sabrina.torres@seed-realistic.kloop' },
]

const MALE_USERS = [
  { name: 'André Mendes',         email: 'andre.mendes@seed-realistic.kloop' },
  { name: 'Bruno Silva',          email: 'bruno.silva@seed-realistic.kloop' },
  { name: 'Carlos Eduardo Souza', email: 'carlos.eduardo@seed-realistic.kloop' },
  { name: 'Diego Fernandes',      email: 'diego.fernandes@seed-realistic.kloop' },
  { name: 'Eduardo Moreira',      email: 'eduardo.moreira@seed-realistic.kloop' },
  { name: 'Felipe Castro',        email: 'felipe.castro@seed-realistic.kloop' },
  { name: 'Gustavo Rocha',        email: 'gustavo.rocha@seed-realistic.kloop' },
  { name: 'Henrique Vieira',      email: 'henrique.vieira@seed-realistic.kloop' },
  { name: 'Igor Ramos',           email: 'igor.ramos@seed-realistic.kloop' },
  { name: 'João Pedro Lopes',     email: 'joao.pedro@seed-realistic.kloop' },
  { name: 'Lucas Barbosa',        email: 'lucas.barbosa@seed-realistic.kloop' },
  { name: 'Matheus Corrêa',       email: 'matheus.correa@seed-realistic.kloop' },
  { name: 'Nicolas Araújo',       email: 'nicolas.araujo@seed-realistic.kloop' },
  { name: 'Rafael Cunha',         email: 'rafael.cunha@seed-realistic.kloop' },
  { name: 'Thiago Dias',          email: 'thiago.dias@seed-realistic.kloop' },
]

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIÇÕES REALISTAS
// ─────────────────────────────────────────────────────────────────────────────

const DESCRIPTIONS_FEMALE = [
  'Peça em ótimo estado, usada poucas vezes. Sem marcas de uso, conservada com cuidado.',
  'Comprei mas não me adaptei ao estilo. Nota 9/10, perfeita para quem procura qualidade.',
  'Peça seminova, lavada e passada. Perfeita para o dia a dia ou ocasiões especiais.',
  'Usada somente uma vez em evento. Estado impecável, igual à nova. Aproveite!',
  'Produto em excelente estado. Guarda-roupa renovado, precisa sair. Sem trocas.',
  'Peça linda, mas mudei meu estilo. Bem cuidada, sem furos, manchas ou odores.',
  'Comprei online e não serviu bem. Tag ainda intacta. Qualidade excelente.',
  'Usada poucas vezes, sempre lavada à mão. Cor vibrante, tecido sem desgaste.',
  'Peça em estado 9/10. Pequeno detalhe no forro interno que não aparece no uso.',
  'Presente que não utilizei. Perfeita condição, na embalagem original. Últimas peças.',
  'Desfazendo o guarda-roupa. Peça bem conservada, sem defeitos visíveis.',
  'Comprei, usei três vezes e não adaptei. Ótima opção para quem quer economizar.',
]

const DESCRIPTIONS_MALE = [
  'Peça em ótimo estado, usada poucas vezes. Sem marcas de uso.',
  'Comprei mas não me adaptei ao corte. Nota 9/10. Original e autêntico.',
  'Seminovo, lavado e passado. Ótimo para o dia a dia ou balada.',
  'Usado somente em evento. Estado impecável, igual ao novo.',
  'Guarda-roupa renovado, precisa sair. Sem trocas, preço justo.',
  'Peça original, bem conservada, sem furos ou manchas. Confira as fotos.',
  'Comprei online e não serviu. Qualidade excelente, entrego com nota fiscal.',
  'Usado poucas vezes, sempre lavado à mão. Sem desgaste visível.',
  'Estado 9/10. Vendendo para renovar o estilo. Parcelo no cartão.',
  'Presente que não utilizei. Perfeita condição. Preço negociável.',
  'Desfazendo o guarda-roupa. Bem conservado, oportunidade única.',
  'Comprei, usei duas vezes e preferi outro modelo. Ótima oportunidade.',
]

// ─────────────────────────────────────────────────────────────────────────────
// POOL DE PRODUTOS
// ─────────────────────────────────────────────────────────────────────────────

interface ProductTemplate {
  title: string
  basePriceCents: number
  condition: ListingCondition
  imageId: string
  category: 'roupas' | 'calcados' | 'bolsas' | 'acessorios'
}

const FEMALE_PRODUCTS: ProductTemplate[] = [
  { title: 'Vestido midi floral Zara M',      basePriceCents:  8900, condition: 'LIKE_NEW', imageId: '1485462537746-965f33f7f6a7', category: 'roupas'    },
  { title: 'Blusa cropped branca Renner P',   basePriceCents:  3500, condition: 'GOOD',     imageId: '1554568218-0f1715e72254',   category: 'roupas'    },
  { title: 'Calça jeans skinny preta 36',     basePriceCents:  7500, condition: 'LIKE_NEW', imageId: '1583496661160-fb5218beaeaa', category: 'roupas'   },
  { title: 'Saia midi plissada verde 38',     basePriceCents:  6500, condition: 'GOOD',     imageId: '1515886657613-9f3515b0c78f', category: 'roupas'   },
  { title: 'Blazer alfaiataria bege 38',      basePriceCents: 12000, condition: 'LIKE_NEW', imageId: '1581044777-7616f7e37d4f',   category: 'roupas'    },
  { title: 'Jaqueta de couro preta P',        basePriceCents: 18000, condition: 'GOOD',     imageId: '1551028719-00167b16eac5',   category: 'roupas'    },
  { title: 'Conjunto moletom cinza M',        basePriceCents:  9500, condition: 'LIKE_NEW', imageId: '1524504388-8829ce60129a',   category: 'roupas'    },
  { title: 'Camisa social listrada M',        basePriceCents:  5500, condition: 'GOOD',     imageId: '1596755094514-f87e34085b2c', category: 'roupas'   },
  { title: 'Sandália salto bloco nude 36',    basePriceCents:  8500, condition: 'LIKE_NEW', imageId: '1543163521-1bf539c55dd2',   category: 'calcados'  },
  { title: 'Tênis Nike Air Max branco 37',    basePriceCents: 22000, condition: 'GOOD',     imageId: '1542291026-7eec264c27ff',   category: 'calcados'  },
  { title: 'Sapatilha nude 37',              basePriceCents:  4500, condition: 'FAIR',     imageId: '1549298916-b41d501d3772',   category: 'calcados'  },
  { title: 'Bolsa couro caramelo pequena',    basePriceCents: 15000, condition: 'LIKE_NEW', imageId: '1548036328-c9fa89d128fa',   category: 'bolsas'    },
  { title: 'Óculos de sol gatinho dourado',   basePriceCents:  6000, condition: 'GOOD',     imageId: '1508296695146-257a814070b4', category: 'acessorios' },
  { title: 'Bolsa transversal preta',         basePriceCents: 11000, condition: 'LIKE_NEW', imageId: '1553062407-98eeb64c6a62',   category: 'bolsas'    },
  { title: 'Top cropped estampado P',         basePriceCents:  2800, condition: 'GOOD',     imageId: '1503657563487-53dae16ef493', category: 'roupas'   },
  { title: 'Calça wide leg bege 38',          basePriceCents:  9800, condition: 'LIKE_NEW', imageId: '1496747488588-d82de5c1d386', category: 'roupas'   },
  { title: 'Vestido slip dress preto M',      basePriceCents:  7500, condition: 'LIKE_NEW', imageId: '1566206091558-7f218b696731', category: 'roupas'   },
  { title: 'Kimono estampado M',             basePriceCents:  4800, condition: 'GOOD',     imageId: '1485462537746-965f33f7f6a7', category: 'roupas'   },
]

const MALE_PRODUCTS: ProductTemplate[] = [
  { title: 'Camisa polo preta G',             basePriceCents:  6500, condition: 'GOOD',     imageId: '1507679799987-c73779587ccf', category: 'roupas'    },
  { title: 'Camiseta oversized cinza M',       basePriceCents:  4000, condition: 'GOOD',     imageId: '1521572163474-6864f9cf17ab', category: 'roupas'    },
  { title: 'Calça chino bege 40',             basePriceCents:  8500, condition: 'LIKE_NEW', imageId: '1548126032-079a0fb0099d',   category: 'roupas'    },
  { title: 'Jaqueta jeans azul escuro M',      basePriceCents: 13000, condition: 'GOOD',     imageId: '1588850561407-ed78c282e89b', category: 'roupas'   },
  { title: 'Camisa social branca slim M',      basePriceCents:  7000, condition: 'LIKE_NEW', imageId: '1519085360753-af0119f7cbe7', category: 'roupas'   },
  { title: 'Moletom capuz verde musgo G',      basePriceCents:  9500, condition: 'GOOD',     imageId: '1556821840-3a63f15732ce',   category: 'roupas'    },
  { title: 'Bermuda tactel cinza G',          basePriceCents:  4500, condition: 'GOOD',     imageId: '1591195853828-11db59a44f43', category: 'roupas'   },
  { title: 'Tênis Vans Old Skool preto 41',    basePriceCents: 18000, condition: 'GOOD',     imageId: '1606107557195-0e29a4b5b4aa', category: 'calcados' },
  { title: 'Tênis Nike Air Force 1 branco 42', basePriceCents: 25000, condition: 'LIKE_NEW', imageId: '1542291026-7eec264c27ff',   category: 'calcados'  },
  { title: 'Tênis adidas Stan Smith 41',       basePriceCents: 19500, condition: 'GOOD',     imageId: '1539185441755-769473a23570', category: 'calcados' },
  { title: 'Relógio analógico prata',         basePriceCents: 12000, condition: 'LIKE_NEW', imageId: '1523275335684-37898b6baf30', category: 'acessorios' },
  { title: 'Mochila escolar preta',           basePriceCents:  8500, condition: 'GOOD',     imageId: '1553062407-98eeb64c6a62',   category: 'acessorios' },
  { title: 'Cinto de couro marrom',           basePriceCents:  5500, condition: 'GOOD',     imageId: '1506629082153-54686c615272', category: 'acessorios' },
  { title: 'Óculos de sol aviador dourado',   basePriceCents:  7500, condition: 'LIKE_NEW', imageId: '1508296695146-257a814070b4', category: 'acessorios' },
  { title: 'Suéter tricot off-white M',       basePriceCents:  7800, condition: 'GOOD',     imageId: '1552374196-c4e7ffc6e126',   category: 'roupas'    },
  { title: 'Camisa xadrez flanela L',         basePriceCents:  5500, condition: 'FAIR',     imageId: '1507679799987-c73779587ccf', category: 'roupas'   },
  { title: 'Short corrida azul M',            basePriceCents:  3800, condition: 'GOOD',     imageId: '1591195853828-11db59a44f43', category: 'roupas'   },
  { title: 'Coturno preto 41',               basePriceCents: 16500, condition: 'GOOD',     imageId: '1543163521-1bf539c55dd2',   category: 'calcados'  },
]

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

function buildImageUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=800&q=80&fit=crop`
}

/**
 * Varia o preço deterministicamente por usuário/listing: -10% a +10%.
 * Garante mínimo de R$20 (2000 centavos).
 */
function varyPrice(baseCents: number, userIndex: number, listingIndex: number): number {
  const variationPercent = ((userIndex * 7 + listingIndex * 3) % 20) - 10
  const delta = Math.round((baseCents * variationPercent) / 100)
  return Math.max(2000, baseCents + delta)
}

function pickDescription(pool: string[], userIndex: number, listingIndex: number): string {
  return pool[(userIndex * 3 + listingIndex) % pool.length]
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLUÇÃO DE CATEGORIAS
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryIds {
  femaleRoupas: string
  femaleCalcados: string
  femaleBolsas: string
  femaleAcessorios: string
  maleRoupas: string
  maleCalcados: string
  maleAcessorios: string
}

async function resolveCategories(): Promise<CategoryIds> {
  const mocasDept = await prisma.category.findFirst({
    where: { name: { contains: 'mo', mode: 'insensitive' }, parentId: null },
  })

  const rapazesDept = await prisma.category.findFirst({
    where: { name: { contains: 'rapaz', mode: 'insensitive' }, parentId: null },
  })

  async function findSubcat(deptId: string, keyword: string): Promise<string> {
    const sub = await prisma.category.findFirst({
      where: { parentId: deptId, name: { contains: keyword, mode: 'insensitive' } },
    })
    if (sub) return sub.id
    const anyChild = await prisma.category.findFirst({ where: { parentId: deptId } })
    if (anyChild) return anyChild.id
    return deptId
  }

  async function globalFallback(): Promise<string> {
    const leaf = await prisma.category.findFirst({ where: { children: { none: {} } } })
    if (leaf) return leaf.id
    const any = await prisma.category.findFirst()
    if (any) return any.id
    throw new Error('Nenhuma categoria encontrada. Execute o seed principal primeiro.')
  }

  const femaleDeptId = mocasDept?.id ?? (await globalFallback())
  const maleDeptId = rapazesDept?.id ?? (await globalFallback())

  const [femaleRoupas, femaleCalcados, femaleBolsas, femaleAcessorios] = await Promise.all([
    findSubcat(femaleDeptId, 'roupa'),
    findSubcat(femaleDeptId, 'cal'),
    findSubcat(femaleDeptId, 'bolsa'),
    findSubcat(femaleDeptId, 'acess'),
  ])

  const [maleRoupas, maleCalcados, maleAcessorios] = await Promise.all([
    findSubcat(maleDeptId, 'roupa'),
    findSubcat(maleDeptId, 'cal'),
    findSubcat(maleDeptId, 'acess'),
  ])

  return { femaleRoupas, femaleCalcados, femaleBolsas, femaleAcessorios, maleRoupas, maleCalcados, maleAcessorios }
}

function resolveCategoryId(
  product: ProductTemplate,
  gender: 'female' | 'male',
  cats: CategoryIds,
): string {
  if (gender === 'female') {
    if (product.category === 'calcados')   return cats.femaleCalcados
    if (product.category === 'bolsas')     return cats.femaleBolsas
    if (product.category === 'acessorios') return cats.femaleAcessorios
    return cats.femaleRoupas
  }
  if (product.category === 'calcados')   return cats.maleCalcados
  if (product.category === 'acessorios') return cats.maleAcessorios
  return cats.maleRoupas
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Iniciando seed-realistic...')

  // 1. Limpeza idempotente
  console.log('Removendo dados anteriores do seed realístico...')
  const deleted = await prisma.user.deleteMany({
    where: { email: { endsWith: '@seed-realistic.kloop' } },
  })
  console.log(`${deleted.count} usuário(s) removido(s) em cascata.`)

  // 2. Resolver categorias
  console.log('Resolvendo categorias...')
  const cats = await resolveCategories()

  let totalUsers = 0
  let totalListings = 0

  // 3. Usuárias femininas
  for (let ui = 0; ui < FEMALE_USERS.length; ui++) {
    const userData = FEMALE_USERS[ui]

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        emailVerified: new Date(),
        role: 'USER',
      },
    })
    totalUsers++

    for (let li = 0; li < 12; li++) {
      const tpl = FEMALE_PRODUCTS[li % FEMALE_PRODUCTS.length]
      const priceCents = varyPrice(tpl.basePriceCents, ui, li)
      const slug = `sr-f${ui}-${li}`
      const description = pickDescription(DESCRIPTIONS_FEMALE, ui, li)
      const categoryId = resolveCategoryId(tpl, 'female', cats)

      const listing = await prisma.listing.create({
        data: {
          sellerId: user.id,
          categoryId,
          title: tpl.title,
          slug,
          description,
          priceCents,
          condition: tpl.condition,
          status: 'ACTIVE' as ListingStatus,
          acceptsOffers: true,
          smartPriceEnabled: false,
        },
      })

      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: buildImageUrl(tpl.imageId),
          displayOrder: 0,
          altText: tpl.title,
        },
      })

      totalListings++
    }

    console.log(`[F ${ui + 1}/15] ${userData.name} — 12 listings criados`)
  }

  // 4. Usuários masculinos
  for (let ui = 0; ui < MALE_USERS.length; ui++) {
    const userData = MALE_USERS[ui]

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        emailVerified: new Date(),
        role: 'USER',
      },
    })
    totalUsers++

    for (let li = 0; li < 12; li++) {
      const tpl = MALE_PRODUCTS[li % MALE_PRODUCTS.length]
      // Offset de 15 no userIndex para garantir variação de preço diferente dos femininos
      const priceCents = varyPrice(tpl.basePriceCents, ui + 15, li)
      const slug = `sr-m${ui}-${li}`
      const description = pickDescription(DESCRIPTIONS_MALE, ui, li)
      const categoryId = resolveCategoryId(tpl, 'male', cats)

      const listing = await prisma.listing.create({
        data: {
          sellerId: user.id,
          categoryId,
          title: tpl.title,
          slug,
          description,
          priceCents,
          condition: tpl.condition,
          status: 'ACTIVE' as ListingStatus,
          acceptsOffers: true,
          smartPriceEnabled: false,
        },
      })

      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: buildImageUrl(tpl.imageId),
          displayOrder: 0,
          altText: tpl.title,
        },
      })

      totalListings++
    }

    console.log(`[M ${ui + 1}/15] ${userData.name} — 12 listings criados`)
  }

  console.log('')
  console.log('=== SEED-REALISTIC CONCLUIDO ===')
  console.log(`Usuarios criados : ${totalUsers}`)
  console.log(`Listings criados : ${totalListings}`)
  console.log('================================')
}

main()
  .catch((e) => {
    console.error('Erro no seed-realistic:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
