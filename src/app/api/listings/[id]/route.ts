import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createListingSchema } from '@/lib/validators/listing'
import { generateUniqueSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import type { ListingCondition } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id: listingId } = await params

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true, slug: true, title: true },
  })

  if (!existing) return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 })
  if (existing.sellerId !== session.user.id) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  if (existing.status === 'SOLD') {
    return NextResponse.json({ error: 'Não é possível editar um anúncio vendido' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const parsed = createListingSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const { title, description, priceCents, categoryId, condition, brand, size, images, acceptsOffers, smartPriceEnabled } =
    parsed.data

  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { children: true } } },
  })
  if (!category) return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 422 })
  if (category._count.children > 0) {
    return NextResponse.json({ error: 'Selecione uma categoria mais específica' }, { status: 422 })
  }

  const slug = title !== existing.title ? await generateUniqueSlug(title, listingId) : existing.slug

  const idealPriceMinCents = smartPriceEnabled ? Math.round(priceCents * 0.70) : null
  const idealPriceMaxCents = smartPriceEnabled ? priceCents : null

  await db.$transaction(async (tx) => {
    await tx.listingImage.deleteMany({ where: { listingId } })
    await tx.listing.update({
      where: { id: listingId },
      data: {
        categoryId,
        title,
        slug,
        description,
        priceCents,
        condition: condition as ListingCondition,
        brand: brand ?? null,
        size: size ?? null,
        acceptsOffers,
        smartPriceEnabled,
        idealPriceMinCents,
        idealPriceMaxCents,
      },
    })
    await tx.listingImage.createMany({
      data: images.map((img, i) => ({
        listingId,
        url: img.url,
        publicId: img.publicId,
        displayOrder: i,
        altText: title,
      })),
    })
  })

  revalidatePath(`/listing/${slug}`)
  revalidatePath('/minha-loja')
  revalidatePath('/')

  return NextResponse.json({ slug })
}
