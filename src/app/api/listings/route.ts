import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createListingSchema } from "@/lib/validators/listing"
import { generateUniqueSlug } from "@/lib/slug"
import { revalidatePath } from "next/cache"
import type { ListingCondition } from "@prisma/client"

export async function GET() {
  return NextResponse.json({ listings: [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = session.user.id

  // Defense in depth: require address
  const address = await db.address.findFirst({ where: { userId } })
  if (!address) {
    return NextResponse.json(
      { error: "Você precisa cadastrar um endereço antes de criar um anúncio." },
      { status: 400 },
    )
  }

  // Plan limit check
  const subscription = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: { select: { maxActiveListings: true, name: true } } },
  })
  const maxListings = subscription?.plan?.maxActiveListings ?? 5
  if (maxListings !== -1) {
    const activeCount = await db.listing.count({
      where: { sellerId: userId, status: "ACTIVE" },
    })
    if (activeCount >= maxListings) {
      const planName = subscription?.plan?.name ?? "Free"
      return NextResponse.json(
        {
          error: `Você atingiu o limite de ${maxListings} anúncios do plano ${planName}. Faça upgrade ou pause algum anúncio.`,
        },
        { status: 403 },
      )
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const parsed = createListingSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const { title, description, priceCents, categoryId, condition, brand, size, images } =
    parsed.data

  // Verify category is a leaf (no children)
  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { children: true } } },
  })
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 422 })
  }
  if (category._count.children > 0) {
    return NextResponse.json(
      { error: "Selecione uma categoria mais específica" },
      { status: 422 },
    )
  }

  const slug = await generateUniqueSlug(title)

  const listing = await db.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        sellerId: userId,
        categoryId,
        title,
        slug,
        description,
        priceCents,
        condition: condition as ListingCondition,
        brand: brand ?? null,
        size: size ?? null,
        status: "ACTIVE",
      },
    })

    await tx.listingImage.createMany({
      data: images.map((img, i) => ({
        listingId: created.id,
        url: img.url,
        publicId: img.publicId,
        displayOrder: i,
        altText: title,
      })),
    })

    return created
  })

  revalidatePath("/")
  return NextResponse.json({ slug: listing.slug })
}
