import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import slugify from 'slugify'

function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: 'pt' })
}

function formatCategoryName(text: string): string {
  if (!text) return ''
  
  const lowers = ['e', 'de', 'da', 'do', 'das', 'dos', 'para', 'com']
  
  return text.split(' ').map((word, index) => {
    const lowerWord = word.toLowerCase()
    // Se for preposição e não for a primeira palavra, mantém minúsculo
    if (lowers.includes(lowerWord) && index !== 0) {
      return lowerWord
    }
    // Capitaliza a primeira letra da palavra
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1)
  }).join(' ')
}

export async function seedCategories(prisma: PrismaClient): Promise<Map<string, string>> {
  const csvPath = path.join(process.cwd(), 'categorias.csv')
  let content = fs.readFileSync(csvPath, 'utf-8')

  // 1. HIGIENIZAÇÃO DO CSV (A Bala de Prata)
  // Substituímos as categorias que têm vírgulas no nome pelas versões com aspas duplas.
  // Assim, o parser nativo entende que é uma coluna só.
  // Também já aplicamos a regra de negócio do Titi: "casa e decor" -> "Casa e Decoração"
  // 1. HIGIENIZAÇÃO DO CSV (A Bala de Prata)
  content = content
    .replace(/casa e decor/gi, 'Casa e Decoração')
    .replace(/cama,mesa e banho/gi, '"Cama, Mesa e Banho"')
    .replace(/cama, berço e banho/gi, '"Cama, Berço e Banho"')
    .replace(/cd's, dvd's e fitas/gi, '"CDs, DVDs e Fitas"')
    .replace(/"figurinhas, selos e cartções"/gi, '"Figurinhas, Selos e Cartões"') // <-- Ajustado: inclui as aspas originais no regex

  // 2. PARSER LIMPO E ROBUSTO
  const rawRows = parse(content, {
    delimiter: ',',
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true, // <-- NOVO: Blinda o parser contra aspas soltas ou mal formatadas
  }) as string[][]

  // Ignora a linha de cabeçalho
  const dataRows = rawRows.filter((r) => r[0].toLowerCase() !== 'departamento')

  const slugToId = new Map<string, string>()
  const leafMap = new Map<string, string>()
  const sortCounters = new Map<string, number>()

  function nextSort(parentKey: string): number {
    const n = sortCounters.get(parentKey) ?? 0
    sortCounters.set(parentKey, n + 1)
    return n
  }

  async function upsertNode(
    name: string,
    slug: string,
    parentId: string | null,
    sortOrder: number,
  ): Promise<string> {
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
    
    // ... o resto do código continua igualzinho

    if (!deptName || !catName) continue

    // Nível 1: Departamento
    const deptSlug = toSlug(deptName)
    const deptId = await upsertNode(deptName, deptSlug, null, nextSort('root'))

    // Nível 2: Categoria
    const catSlug = `${deptSlug}-${toSlug(catName)}`
    const catId = await upsertNode(catName, catSlug, deptId, nextSort(deptSlug))

    if (!subName) {
      leafMap.set(catSlug, catId)
      continue
    }

    // Nível 3: Subcategoria
    const subSlug = `${catSlug}-${toSlug(subName)}`
    const subId = await upsertNode(subName, subSlug, catId, nextSort(catSlug))

    if (!charName) {
      leafMap.set(subSlug, subId)
      continue
    }

    // Nível 4: Característica
    const charSlug = `${subSlug}-${toSlug(charName)}`
    const charId = await upsertNode(charName, charSlug, subId, nextSort(subSlug))
    leafMap.set(charSlug, charId)
  }

  console.log(`✅ Categorias: ${slugToId.size} nós criados/atualizados`)
  return leafMap
}