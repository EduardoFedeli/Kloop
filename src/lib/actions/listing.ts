"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { listingSchema } from "@/lib/validators/listing"
import { generateUniqueSlug } from "@/lib/slug"
import { revalidatePath } from "next/cache"
import type { ListingCondition } from "@prisma/client"

export type ListingActionResult =
  | { success: true; slug?: string }
  | { success: false; error: string }

function parsePriceCents(value: string): number {
  // Aceita "50,00" (pt-BR) ou "50.00" (en-US)
  const normalized = value.replace(/\./g, "").replace(",", ".")
  const num = parseFloat(normalized)
  return Math.round(num * 100)
}

function extractImageUrls(formData: FormData): string[] {
  return (formData.getAll("imageUrls") as string[]).filter(Boolean)
}

export async function createListingAction(formData: FormData): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const userId = session.user.id

  // Verificar limite do plano
  const subscription = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: { select: { maxActiveListings: true, name: true } } },
  })

  const maxListings = subscription?.plan?.maxActiveListings ?? 15
  if (maxListings !== -1) {
    const activeCount = await db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } })
    if (activeCount >= maxListings) {
      const planName = subscription?.plan?.name ?? "Free"
      return {
        success: false,
        error: `Você atingiu o limite de ${maxListings} anúncios do plano ${planName}. Faça upgrade para continuar.`,
      }
    }
  }

  // Resolver categoria a partir do caminho selecionado no formulário
  const subcategoryName = (formData.get("subcategory") as string) || ""
  const categoryName = (formData.get("category") as string) || ""
  const searchName = subcategoryName || categoryName

  let resolvedCategory = searchName
    ? await db.category.findFirst({
        where: { name: { contains: searchName, mode: "insensitive" } },
        select: { id: true },
      })
    : null

  if (!resolvedCategory) {
    resolvedCategory = await db.category.findFirst({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    })
  }

  if (!resolvedCategory) return { success: false, error: "Nenhuma categoria disponível. Contate o suporte." }

  const priceRaw = formData.get("price") as string
  const priceCents = parsePriceCents(priceRaw)
  if (isNaN(priceCents) || priceCents <= 0) {
    return { success: false, error: "Preço inválido. Use o formato 50,00" }
  }

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents,
    categoryId: resolvedCategory.id,
    condition: formData.get("condition"),
    brand: formData.get("brand") || undefined,
    size: formData.get("weight") || undefined,
    imageUrls: extractImageUrls(formData),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { title, description, priceCents: price, categoryId, condition, brand, size, imageUrls } =
    parsed.data

  const slug = await generateUniqueSlug(title)

  await db.listing.create({
    data: {
      sellerId: userId,
      categoryId,
      title,
      slug,
      description,
      priceCents: price,
      condition: condition as ListingCondition,
      brand: brand || null,
      size: size || null,
      status: "ACTIVE",
      images: {
        create: imageUrls.map((url, i) => ({ url, displayOrder: i, altText: title })),
      },
    },
  })

  revalidatePath("/")
  return { success: true, slug }
}


export async function updateListingAction(
  listingId: string,
  formData: FormData
): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true, slug: true, title: true },
  })

  if (!existing) return { success: false, error: "Anúncio não encontrado" }
  if (existing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }
  if (existing.status === "SOLD")
    return { success: false, error: "Não é possível editar um anúncio vendido" }

  const priceRaw = formData.get("price") as string
  const priceCents = parsePriceCents(priceRaw)
  if (isNaN(priceCents) || priceCents <= 0) {
    return { success: false, error: "Preço inválido. Use o formato 50,00" }
  }

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents,
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    brand: formData.get("brand") || undefined,
    size: formData.get("size") || undefined,
    imageUrls: extractImageUrls(formData),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { title, description, priceCents: price, categoryId, condition, brand, size, imageUrls } =
    parsed.data

  // Regenerar slug apenas se o título mudou
  const slug =
    title !== existing.title ? await generateUniqueSlug(title, listingId) : existing.slug

  await db.$transaction(async (tx) => {
    await tx.listingImage.deleteMany({ where: { listingId } })
    await tx.listing.update({
      where: { id: listingId },
      data: {
        categoryId,
        title,
        slug,
        description,
        priceCents: price,
        condition: condition as ListingCondition,
        brand: brand || null,
        size: size || null,
      },
    })
    if (imageUrls.length > 0) {
      await tx.listingImage.createMany({
        data: imageUrls.map((url, i) => ({ listingId, url, displayOrder: i, altText: title })),
      })
    }
  })

  revalidatePath(`/listing/${slug}`)
  revalidatePath("/dashboard")
  return { success: true, slug }
}

export async function deleteListingAction(listingId: string): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  })

  if (!listing) return { success: false, error: "Anúncio não encontrado" }
  if (listing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }

  await db.listing.delete({ where: { id: listingId } })

  revalidatePath("/dashboard")
  revalidatePath("/")
  return { success: true }
}

export async function toggleListingStatusAction(listingId: string): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  })

  if (!listing) return { success: false, error: "Anúncio não encontrado" }
  if (listing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }
  if (listing.status === "SOLD")
    return { success: false, error: "Não é possível alterar status de um anúncio vendido" }

  const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
  await db.listing.update({ where: { id: listingId }, data: { status: newStatus } })

  revalidatePath("/dashboard")
  return { success: true }
}
