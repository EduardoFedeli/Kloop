import slugify from "slugify"
import { db } from "@/lib/db"

export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, locale: "pt" })

  const isAvailable = async (slug: string): Promise<boolean> => {
    const count = await db.listing.count({
      where: {
        slug,
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
