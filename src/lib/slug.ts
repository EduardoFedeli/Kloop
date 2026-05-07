import slugifyPkg from "slugify"
import { db } from "@/lib/db"

// Função genérica síncrona para gerar slugs (usada nas Marcas, Categorias, etc)
export function slugify(text: string): string {
  return slugifyPkg(text, { lower: true, strict: true, locale: "pt" })
}

// Função assíncrona específica para Anúncios (checa duplicidade na tabela Listing)
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title)

  const isAvailable = async (slugToCheck: string): Promise<boolean> => {
    const count = await db.listing.count({
      where: {
        slug: slugToCheck,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
    return count === 0
  }

  if (await isAvailable(base)) return base

  let counter = 2
  while (!(await isAvailable(`${base}-${counter}`))) {
    counter++
  }
  return `${base}-${counter}`
}