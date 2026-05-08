import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { EditListingForm } from "@/components/listing/EditListingForm"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditListingPage({ params }: Props) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user?.id) redirect("/")

  // ATUALIZADO: Adicionamos a busca das brands
  const [listing, categories, brands] = await Promise.all([
    db.listing.findUnique({
      where: { slug },
      select: {
        id: true,
        sellerId: true,
        status: true,
        title: true,
        description: true,
        priceCents: true,
        categoryId: true,
        condition: true,
        // ATUALIZADO: Traz o brandId em vez de brand
        brandId: true,
        size: true,
        acceptsOffers: true,
        smartPriceEnabled: true,
        isTurbinado: true,
        images: {
          orderBy: { displayOrder: "asc" },
          select: { url: true, publicId: true },
        },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true },
    }),
    db.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!listing) notFound()
  if (listing.sellerId !== session.user.id) redirect(`/profile/${session.user.id}`)
  if (listing.status === "SOLD") redirect(`/listing/${slug}`)

  const initialData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    priceCents: listing.priceCents,
    categoryId: listing.categoryId,
    condition: listing.condition,
    // ATUALIZADO: Repassando o brandId
    brandId: listing.brandId,
    size: listing.size,
    acceptsOffers: listing.acceptsOffers,
    smartPriceEnabled: listing.smartPriceEnabled,
    isTurbinado: listing.isTurbinado,
    // Agora aceitamos as imagens mesmo se o publicId for nulo, usando a própria URL como ID temporário
    images: listing.images.map((img) => ({ url: img.url, publicId: img.publicId || img.url })),
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-[20px] font-black text-[var(--foreground)] mb-1">editar anúncio</h1>
      <p className="text-[13px] text-gray-500 dark:text-sage mb-6">
        Atualize as informações do seu anúncio abaixo.
      </p>
      {/* ATUALIZADO: Passando a prop brands */}
      <EditListingForm initialData={initialData} categories={categories} brands={brands} />
    </div>
  )
}