// prisma/seed.ts
import { PrismaClient, ListingCondition, ListingStatus } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

function s(str: string) {
  return slugify(str, { lower: true, strict: true })
}

// Build a slug that's unique even when category names collide across depts
function cslug(...parts: string[]) {
  return parts.map(s).join('--')
}

async function upsertCat(name: string, parentId: string | null, sort = 0) {
  const slug = parentId ? cslug(parentId.slice(-8), name) : s(name)
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, parentId, sortOrder: sort },
  })
}

async function main() {
  // ── Plans ──────────────────────────────────────────────────────────────────
  await prisma.subscriptionPlan.upsert({ where: { slug: 'free' }, update: {}, create: { name: 'Free', slug: 'free', priceCents: 0, maxActiveListings: 5, commissionRate: 0.08, features: {} } })
  await prisma.subscriptionPlan.upsert({ where: { slug: 'plus' }, update: {}, create: { name: 'Plus', slug: 'plus', priceCents: 1490, maxActiveListings: 25, commissionRate: 0.03, features: { analytics: true, badge: true } } })
  await prisma.subscriptionPlan.upsert({ where: { slug: 'pro' },  update: {}, create: { name: 'Pro',  slug: 'pro',  priceCents: 3990, maxActiveListings: -1, commissionRate: 0.0,  features: { boosts: true, analytics: true, badge: true } } })
  console.log('✅ Planos')

  // ── Users ──────────────────────────────────────────────────────────────────
  const ana = await prisma.user.upsert({
    where: { email: 'ana@thexgarage.test' }, update: {},
    create: { name: 'Ana Lima', email: 'ana@thexgarage.test', addresses: { create: { label: 'Casa', street: 'Rua das Flores', number: '123', neighborhood: 'Jardim Paulista', city: 'São Paulo', state: 'SP', zipCode: '01310-100', isDefault: true } } },
  })
  const carlos = await prisma.user.upsert({
    where: { email: 'carlos@thexgarage.test' }, update: {},
    create: { name: 'Carlos Souza', email: 'carlos@thexgarage.test', addresses: { create: { label: 'Casa', street: 'Av. Atlântica', number: '456', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', zipCode: '22010-000', isDefault: true } } },
  })
  console.log('✅ Usuários')

  // ── Category hierarchy ─────────────────────────────────────────────────────
  // Level 0: departments
  const dMocas   = await upsertCat('moças', null, 1)
  const dRapazes = await upsertCat('rapazes', null, 2)
  const dCriancas = await upsertCat('crianças', null, 3)
  const dCasa    = await upsertCat('casa e decor', null, 4)
  const dEletro  = await upsertCat('eletrônicos', null, 5)
  const dEletrod = await upsertCat('eletrodomésticos', null, 6)
  const dLivros  = await upsertCat('livros e papelarias', null, 7)
  const dPets    = await upsertCat('pets', null, 8)
  const dEtcetal = await upsertCat('etc e tal', null, 9)
  const dAntig   = await upsertCat('antiguidades', null, 10)

  // Level 1: categories for moças
  const mAcess  = await upsertCat('acessórios', dMocas.id, 1)
  const mRoupas = await upsertCat('roupas', dMocas.id, 2)
  const mBeleza = await upsertCat('beleza', dMocas.id, 3)
  const mCalc   = await upsertCat('calçados', dMocas.id, 4)
  const mBolsas = await upsertCat('bolsas', dMocas.id, 5)

  // Level 2: subcategories moças/acessórios
  const mAOculos  = await upsertCat('óculos', mAcess.id, 1)
  const mARelogios = await upsertCat('relógios', mAcess.id, 2)
  const mAJoias   = await upsertCat('jóias e bijuterias', mAcess.id, 3)
  const mACintos  = await upsertCat('cintos', mAcess.id, 4)
  const mAChapeus = await upsertCat('chapéus', mAcess.id, 5)

  // Level 2: subcategories moças/roupas
  const mRBlusas   = await upsertCat('blusas', mRoupas.id, 1)
  const mRCalcas   = await upsertCat('calças', mRoupas.id, 2)
  const mRVestidos = await upsertCat('vestidos', mRoupas.id, 3)
  const mRCamisas  = await upsertCat('camisas', mRoupas.id, 4)
  const mRCasacos  = await upsertCat('casacos e jaquetas', mRoupas.id, 5)
  const mRSaias    = await upsertCat('saias', mRoupas.id, 6)
  const mRShorts   = await upsertCat('shorts e bermudas', mRoupas.id, 7)

  // Level 2: subcategories moças/beleza
  const mBMaquiagens = await upsertCat('maquiagens', mBeleza.id, 1)
  const mBSkincare   = await upsertCat('skincare', mBeleza.id, 2)
  const mBPerfumes   = await upsertCat('perfumes', mBeleza.id, 3)

  // Level 2: subcategories moças/calçados
  const mCBotas   = await upsertCat('botas', mCalc.id, 1)
  const mCSandals = await upsertCat('sandálias e rasteiras', mCalc.id, 2)
  const mCTenis   = await upsertCat('tênis', mCalc.id, 3)
  const mCSapatos = await upsertCat('sapatos', mCalc.id, 4)

  // Level 2: subcategories moças/bolsas
  const mBolMochila   = await upsertCat('mochila', mBolsas.id, 1)
  const mBolClutch    = await upsertCat('clutch', mBolsas.id, 2)
  const mBolCrossbody = await upsertCat('crossbody', mBolsas.id, 3)
  const mBolPochete   = await upsertCat('pochete', mBolsas.id, 4)

  // Level 1: categories for rapazes
  const rAcess  = await upsertCat('acessórios', dRapazes.id, 1)
  const rRoupas = await upsertCat('roupas', dRapazes.id, 2)
  const rCalc   = await upsertCat('calçados', dRapazes.id, 3)
  const rBeleza = await upsertCat('beleza', dRapazes.id, 4)

  // Level 2: rapazes/roupas
  const rRBlusas  = await upsertCat('blusas', rRoupas.id, 1)
  const rRCalcas  = await upsertCat('calças', rRoupas.id, 2)
  const rRCamisas = await upsertCat('camisas', rRoupas.id, 3)
  const rRCasacos = await upsertCat('casacos e jaquetas', rRoupas.id, 4)
  const rRShorts  = await upsertCat('shorts e bermudas', rRoupas.id, 5)

  // Level 2: rapazes/calçados
  const rCTenis   = await upsertCat('tênis', rCalc.id, 1)
  const rCBotas   = await upsertCat('botas', rCalc.id, 2)
  const rCSandals = await upsertCat('sandálias e rasteiras', rCalc.id, 3)

  // Level 1: categories for crianças
  const cRoupas  = await upsertCat('roupas', dCriancas.id, 1)
  const cCalc    = await upsertCat('calçados', dCriancas.id, 2)
  const cBrinq   = await upsertCat('brinquedos', dCriancas.id, 3)
  const cAcess   = await upsertCat('acessórios e enxoval', dCriancas.id, 4)

  const cRBlusas  = await upsertCat('blusas e camisetas', cRoupas.id, 1)
  const cRCalcas  = await upsertCat('calças', cRoupas.id, 2)
  const cRVestidos = await upsertCat('vestidos', cRoupas.id, 3)
  const cCTenis   = await upsertCat('tênis', cCalc.id, 1)
  const cCSandals = await upsertCat('sandálias', cCalc.id, 2)
  const cBBonecos = await upsertCat('bonecos e bonecas', cBrinq.id, 1)
  const cBPelucia = await upsertCat('pelúcias', cBrinq.id, 2)

  // Level 1: categories for casa e decor
  const casaMov  = await upsertCat('móveis', dCasa.id, 1)
  const casaDec  = await upsertCat('decoração e enfeites', dCasa.id, 2)
  const casaIlum = await upsertCat('iluminação', dCasa.id, 3)
  const casaUtil = await upsertCat('utensílios para cozinha', dCasa.id, 4)
  const casaCama = await upsertCat('cama, mesa e banho', dCasa.id, 5)

  // Level 1: categories for eletrônicos
  const eInfo    = await upsertCat('informática', dEletro.id, 1)
  const eSmartph = await upsertCat('smartphones e acessórios', dEletro.id, 2)
  const eAudio   = await upsertCat('áudio e vídeo', dEletro.id, 3)
  const eGames   = await upsertCat('videogames', dEletro.id, 4)
  const eFoto    = await upsertCat('fotografia', dEletro.id, 5)

  // Level 1: categories for eletrodomésticos
  const edCozinha = await upsertCat('cozinha', dEletrod.id, 1)
  const edLimpeza = await upsertCat('limpeza e organização', dEletrod.id, 2)
  const edAr      = await upsertCat('ar e ventilação', dEletrod.id, 3)

  // Level 1: categories for livros
  const livLivros = await upsertCat('livros', dLivros.id, 1)
  const livCad    = await upsertCat('cadernos e blocos', dLivros.id, 2)

  // Level 1: categories for pets
  const petCaminh = await upsertCat('caminhas e casinhas', dPets.id, 1)
  const petBrinq  = await upsertCat('brinquedos', dPets.id, 2)
  const petColeir = await upsertCat('coleiras', dPets.id, 3)
  const petRoupas = await upsertCat('roupinhas e acessórios', dPets.id, 4)

  // Level 1: categories for etc e tal
  const etcMusica  = await upsertCat('música e tv', dEtcetal.id, 1)
  const etcEsporte = await upsertCat('esportes e outdoor', dEtcetal.id, 2)
  const etcJogos   = await upsertCat('jogos', dEtcetal.id, 3)

  console.log('✅ Categorias criadas')

  // ── Listings ───────────────────────────────────────────────────────────────
  type L = { title: string; desc: string; price: number; cond: ListingCondition; catId: string; seller: string; brand?: string; size?: string; n: number }

  const listings: L[] = [
    // moças / roupas
    { title: 'Vestido Floral Farm', desc: 'Vestido floral levinho, perfeito para o verão. Usado uma vez.', price: 4500, cond: 'LIKE_NEW', catId: mRVestidos.id, seller: ana.id, brand: 'Farm', size: 'M', n: 1 },
    { title: 'Jaqueta Jeans Levi\'s Oversized', desc: 'Jaqueta jeans oversized vintage anos 90. Excelente estado.', price: 8900, cond: 'GOOD', catId: mRCasacos.id, seller: carlos.id, brand: "Levi's", size: 'G', n: 2 },
    { title: 'Blusa Cropped Colcci', desc: 'Blusa cropped branca, usada poucas vezes.', price: 3200, cond: 'LIKE_NEW', catId: mRBlusas.id, seller: ana.id, brand: 'Colcci', size: 'P', n: 3 },
    { title: 'Calça Mom Jeans Zara', desc: 'Calça mom jeans lavagem clara, nova com etiqueta.', price: 5500, cond: 'NEW', catId: mRCalcas.id, seller: carlos.id, brand: 'Zara', size: '38', n: 4 },
    { title: 'Saia Midi Animale', desc: 'Saia midi floral estampada. Ótima para ocasiões casuais.', price: 7200, cond: 'LIKE_NEW', catId: mRSaias.id, seller: ana.id, brand: 'Animale', size: 'M', n: 5 },
    // moças / calçados
    { title: 'Tênis Nike Air Force 1', desc: 'Air Force 1 branco feminino, tam 36. Usado poucas vezes.', price: 28000, cond: 'LIKE_NEW', catId: mCTenis.id, seller: carlos.id, brand: 'Nike', size: '36', n: 6 },
    { title: 'Sandália Schutz Dourada', desc: 'Sandália salto fino dourada, tamanho 37. Estado perfeito.', price: 9800, cond: 'GOOD', catId: mCSandals.id, seller: ana.id, brand: 'Schutz', size: '37', n: 7 },
    { title: 'Bota Arezzo Cano Curto', desc: 'Bota cano curto camurça marrom. Pouquíssimo uso.', price: 18000, cond: 'LIKE_NEW', catId: mCBotas.id, seller: carlos.id, brand: 'Arezzo', size: '37', n: 8 },
    // moças / acessórios
    { title: 'Óculos de Sol Ray-Ban Wayfarer', desc: 'Ray-Ban Wayfarer clássico preto, usado com estojo original.', price: 35000, cond: 'GOOD', catId: mAOculos.id, seller: ana.id, brand: 'Ray-Ban', n: 9 },
    { title: 'Relógio Vivara Prata', desc: 'Relógio feminino prateado, pulseira de aço. Funcionando perfeitamente.', price: 22000, cond: 'LIKE_NEW', catId: mARelogios.id, seller: carlos.id, brand: 'Vivara', n: 10 },
    { title: 'Colar Dourado Le Lis Blanc', desc: 'Colar corrente dourado com pingente. Seminovo.', price: 4800, cond: 'LIKE_NEW', catId: mAJoias.id, seller: ana.id, brand: 'Le Lis Blanc', n: 11 },
    // moças / bolsas
    { title: 'Mochila Couro Shoulder', desc: 'Mochila de couro legítimo cor preta. Pouco uso.', price: 32000, cond: 'GOOD', catId: mBolMochila.id, seller: carlos.id, brand: 'Shoulder', size: 'Único', n: 12 },
    { title: 'Clutch Festa Dourada', desc: 'Clutch dourada para festas. Nova sem etiqueta.', price: 5500, cond: 'NEW', catId: mBolClutch.id, seller: ana.id, n: 13 },
    // moças / beleza
    { title: 'Perfume Chanel Chance 100ml', desc: 'Perfume Chanel Chance Eau de Parfum 100ml. 70% restante.', price: 42000, cond: 'GOOD', catId: mBPerfumes.id, seller: carlos.id, brand: 'Chanel', n: 14 },
    { title: 'Paleta de Sombras Urban Decay', desc: 'Paleta Naked3. Usada algumas vezes, higienizada.', price: 18000, cond: 'GOOD', catId: mBMaquiagens.id, seller: ana.id, brand: 'Urban Decay', n: 15 },
    // rapazes / roupas
    { title: 'Camiseta Reserva Estampada', desc: 'Camiseta masculina estampada, tamanho M. Nova.', price: 5900, cond: 'NEW', catId: rRBlusas.id, seller: ana.id, brand: 'Reserva', size: 'M', n: 16 },
    { title: 'Calça Cargo Forum Verde', desc: 'Calça cargo masculina verde militar. Poucas vezes usada.', price: 6800, cond: 'LIKE_NEW', catId: rRCalcas.id, seller: carlos.id, brand: 'Forum', size: '40', n: 17 },
    { title: 'Camisa Social Tommy Hilfiger', desc: 'Camisa social branca manga longa. Excelente estado.', price: 12000, cond: 'LIKE_NEW', catId: rRCamisas.id, seller: ana.id, brand: 'Tommy Hilfiger', size: 'M', n: 18 },
    // rapazes / calçados
    { title: 'Tênis Adidas Ultraboost', desc: 'Adidas Ultraboost preto tam 42. Usado pouquíssimo.', price: 45000, cond: 'LIKE_NEW', catId: rCTenis.id, seller: carlos.id, brand: 'Adidas', size: '42', n: 19 },
    { title: 'Bota Coturno Masculino', desc: 'Coturno preto masculino tam 43. Sem defeitos.', price: 15000, cond: 'GOOD', catId: rCBotas.id, seller: ana.id, size: '43', n: 20 },
    // crianças
    { title: 'Camiseta Menino Hering 6 anos', desc: 'Camiseta azul estampada para menino 6 anos. Nova.', price: 2800, cond: 'NEW', catId: cRBlusas.id, seller: carlos.id, brand: 'Hering', size: '6 anos', n: 21 },
    { title: 'Vestido Infantil 4 anos', desc: 'Vestidinho floral rosa para 4 anos. Excelente estado.', price: 3500, cond: 'LIKE_NEW', catId: cRVestidos.id, seller: ana.id, brand: 'Zara', size: '4 anos', n: 22 },
    { title: 'Tênis Infantil Nike 28', desc: 'Tênis infantil Nike branco tamanho 28. Seminovo.', price: 9800, cond: 'LIKE_NEW', catId: cCTenis.id, seller: carlos.id, brand: 'Nike', size: '28', n: 23 },
    { title: 'Boneca Barbie Extra', desc: 'Barbie Extra edição especial. Nova na caixa.', price: 8500, cond: 'NEW', catId: cBBonecos.id, seller: ana.id, brand: 'Mattel', n: 24 },
    // casa e decor
    { title: 'Poltrona Retrô Mostarda Tok&Stok', desc: 'Poltrona de veludo cor mostarda, estilo retrô. Ótima condição.', price: 45000, cond: 'GOOD', catId: casaMov.id, seller: carlos.id, brand: 'Tok&Stok', n: 25 },
    { title: 'Jogo de Xícaras Cerâmica', desc: 'Jogo de 6 xícaras cerâmica estampada. Nunca usado.', price: 8900, cond: 'NEW', catId: casaUtil.id, seller: ana.id, n: 26 },
    { title: 'Luminária Mesa Design', desc: 'Luminária de mesa articulada cor preto fosco.', price: 12000, cond: 'LIKE_NEW', catId: casaIlum.id, seller: carlos.id, n: 27 },
    { title: 'Jogo de Lençóis 400 fios', desc: 'Lençóis casal 400 fios creme. Usados poucas vezes.', price: 18000, cond: 'GOOD', catId: casaCama.id, seller: ana.id, brand: 'Trussardi', n: 28 },
    // eletrônicos
    { title: 'iPhone 14 128GB', desc: 'iPhone 14 azul 128GB. Bateria em 95%. Com caixa original.', price: 380000, cond: 'LIKE_NEW', catId: eSmartph.id, seller: carlos.id, brand: 'Apple', n: 29 },
    { title: 'Samsung Galaxy S23', desc: 'Samsung S23 256GB cor creme. Excelente estado.', price: 280000, cond: 'LIKE_NEW', catId: eSmartph.id, seller: ana.id, brand: 'Samsung', n: 30 },
    { title: 'Notebook Dell Inspiron 15', desc: 'Dell Inspiron 15" i5 8GB 512GB SSD. Funcionando perfeitamente.', price: 320000, cond: 'GOOD', catId: eInfo.id, seller: carlos.id, brand: 'Dell', n: 31 },
    { title: 'Fone Sony WH-1000XM5', desc: 'Sony WH-1000XM5 preto. Cancelamento de ruído ANC. Com caixa.', price: 180000, cond: 'LIKE_NEW', catId: eAudio.id, seller: ana.id, brand: 'Sony', n: 32 },
    { title: 'PlayStation 5 + 2 controles', desc: 'PS5 edição padrão com 2 controles DualSense. Perfeito.', price: 450000, cond: 'GOOD', catId: eGames.id, seller: carlos.id, brand: 'Sony', n: 33 },
    // eletrodomésticos
    { title: 'Cafeteira Nespresso Vertuo', desc: 'Nespresso Vertuo preta. Usada 3 meses. Com cápsula brinde.', price: 55000, cond: 'LIKE_NEW', catId: edCozinha.id, seller: ana.id, brand: 'Nespresso', n: 34 },
    { title: 'Fritadeira Airfryer Philips', desc: 'Philips Walita Airfryer 4L. Excelente estado. Sem manchas.', price: 42000, cond: 'GOOD', catId: edCozinha.id, seller: carlos.id, brand: 'Philips', n: 35 },
    // livros
    { title: 'Coleção Harry Potter 7 volumes', desc: 'Coleção completa em português, edição Rocco. Boa conservação.', price: 22000, cond: 'GOOD', catId: livLivros.id, seller: ana.id, brand: 'Rocco', n: 36 },
    { title: 'Livro Sapiens Yuval Noah', desc: 'Sapiens — Uma Breve História da Humanidade. Pouquíssimo uso.', price: 4500, cond: 'LIKE_NEW', catId: livLivros.id, seller: carlos.id, brand: 'Companhia das Letras', n: 37 },
    // pets
    { title: 'Caminha Pet Impermeável G', desc: 'Caminha para cães porte grande, impermeável, cor cinza.', price: 15000, cond: 'LIKE_NEW', catId: petCaminh.id, seller: ana.id, n: 38 },
    { title: 'Coleira Couro Cão Médio', desc: 'Coleira de couro legítimo com plaquinha. Tam M.', price: 4200, cond: 'GOOD', catId: petColeir.id, seller: carlos.id, n: 39 },
    // etc e tal
    { title: 'Guitarra Fender Stratocaster', desc: 'Fender Strat sunburst, captadores originais. Ótima conservação.', price: 650000, cond: 'GOOD', catId: etcMusica.id, seller: ana.id, brand: 'Fender', n: 40 },
    { title: 'Bicicleta Caloi Explorer 21v', desc: 'Caloi Explorer aro 29, 21 velocidades. Usada em trilhas.', price: 180000, cond: 'GOOD', catId: etcEsporte.id, seller: carlos.id, brand: 'Caloi', n: 41 },
    { title: 'Jogo Catan', desc: 'Catan edição em português. Completo, todas as peças.', price: 18000, cond: 'LIKE_NEW', catId: etcJogos.id, seller: ana.id, n: 42 },
  ]

  let count = 0
  for (const l of listings) {
    const slug = `${s(l.title)}-${l.n}`
    const listing = await prisma.listing.upsert({
      where: { slug },
      update: { priceCents: l.price, brand: l.brand, size: l.size },
      create: {
        title: l.title, slug, description: l.desc,
        priceCents: l.price, condition: l.cond as ListingCondition,
        status: ListingStatus.ACTIVE,
        categoryId: l.catId, sellerId: l.seller,
        brand: l.brand, size: l.size,
      },
    })
    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } })
    await prisma.listingImage.create({ data: { listingId: listing.id, url: `https://picsum.photos/seed/thex${l.n}/400/400`, displayOrder: 0 } })
    count++
  }

  console.log(`✅ ${count} listings criados`)
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
