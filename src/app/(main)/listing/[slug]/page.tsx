import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, CalendarDays, Eye } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice, formatDate, cn } from "@/lib/utils"
import { PhotoCarousel } from "@/components/listing/PhotoCarousel"
import { ListingActions } from "@/components/listing/ListingActions"
import type { ListingCondition } from "@prisma/client"

const conditionLabel: Record<ListingCondition, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom estado",
  FAIR: "Usado",
}

const conditionColor: Record<ListingCondition, string> = {
  NEW: "bg-celadon text-airforce",
  LIKE_NEW: "bg-teal text-linen",
  GOOD: "bg-teal-muted text-linen",
  FAIR: "bg-teal-muted/60 text-airforce",
}

interface ListingPageProps {
  params: Promise<{ slug: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params
  const session = await auth()

  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { listings: { where: { status: "ACTIVE" } } } },
          reviewsReceived: { select: { rating: true } },
        },
      },
      category: { select: { name: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  })

  if (!listing || listing.status === "DRAFT") notFound()

  // Incrementar viewsCount (fire-and-forget)
  void db.listing
    .update({ where: { id: listing.id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {})

  const isOwner = session?.user?.id === listing.sellerId

  const totalRatings = listing.seller.reviewsReceived.length
  const avgRating =
    totalRatings > 0
      ? (
          listing.seller.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        ).toFixed(1)
      : null

  const sellerInitials = listing.seller.name.substring(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="grid md:grid-cols-2 gap-8">
        <PhotoCarousel images={listing.images} title={listing.title} />

        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-black text-airforce leading-tight flex-1">
                {listing.title}
              </h1>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
                  conditionColor[listing.condition]
                )}
              >
                {conditionLabel[listing.condition]}
              </span>
            </div>
            <p className="text-3xl font-black text-airforce mt-2">
              {formatPrice(listing.priceCents)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-teal-muted">
            <span className="bg-celadon/30 px-3 py-1 rounded-full">{listing.category.name}</span>
            {listing.brand && (
              <span className="bg-celadon/30 px-3 py-1 rounded-full">{listing.brand}</span>
            )}
            {listing.size && (
              <span className="bg-celadon/30 px-3 py-1 rounded-full">Tam. {listing.size}</span>
            )}
            <span className="flex items-center gap-1 text-teal-muted/60">
              <Eye size={11} />
              {listing.viewsCount} visualizações
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-airforce mb-1">Descrição</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="bg-linen rounded-xl p-4 border border-teal-muted/20">
            <h3 className="text-xs font-semibold text-teal-muted uppercase tracking-wide mb-3">
              Vendedor
            </h3>
            <div className="flex items-center gap-3">
              <Link href={`/profile/${listing.seller.id}`}>
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-celadon/30 shrink-0">
                  {listing.seller.avatarUrl ? (
                    <Image
                      src={listing.seller.avatarUrl}
                      alt={listing.seller.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-airforce">
                      {sellerInitials}
                    </div>
                  )}
                </div>
              </Link>
              <div>
                <Link
                  href={`/profile/${listing.seller.id}`}
                  className="font-semibold text-sm text-airforce hover:text-teal transition-colors"
                >
                  {listing.seller.name}
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-muted">
                  {avgRating && (
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="text-yellow-400" />
                      {avgRating} ({totalRatings})
                    </span>
                  )}
                  <span>
                    {listing.seller._count.listings} anúncio
                    {listing.seller._count.listings !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <CalendarDays size={10} />
                    Desde {formatDate(listing.seller.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ListingActions
            listing={{ id: listing.id, slug: listing.slug, status: listing.status }}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  )
}
