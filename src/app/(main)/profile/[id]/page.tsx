import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit3, Star, Package, CalendarDays } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { ListingGrid } from "@/components/listing/ListingGrid"
import type { ListingWithDetails } from "@/types/listing"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const session = await auth()
  const isOwn = session?.user?.id === id

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      reviewsReceived: { select: { rating: true } },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { displayOrder: "asc" },
            take: 1,
            select: { url: true, altText: true },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              addresses: {
                where: { isDefault: true },
                select: { city: true, state: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!user) notFound()

  const totalRatings = user.reviewsReceived.length
  const avgRating =
    totalRatings > 0
      ? (user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
      : null

  const listings: ListingWithDetails[] = user.listings
  const initials = user.name.substring(0, 2).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-celadon/30">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-airforce">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-black text-airforce">{user.name}</h1>
              {isOwn && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-teal hover:text-airforce transition-colors shrink-0"
                >
                  <Edit3 size={14} />
                  Editar perfil
                </Link>
              )}
            </div>
            {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-teal-muted">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                Desde {formatDate(user.createdAt)}
              </span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400" />
                  {avgRating} ({totalRatings} avaliação{totalRatings !== 1 ? "ões" : ""})
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package size={12} />
                {listings.length} anúncio{listings.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-airforce mb-4">Anúncios ativos</h2>
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <p className="text-sm text-teal-muted text-center py-8 bg-white rounded-2xl border border-teal-muted/20">
            Nenhum anúncio ativo no momento.
          </p>
        )}
      </div>
    </div>
  )
}
