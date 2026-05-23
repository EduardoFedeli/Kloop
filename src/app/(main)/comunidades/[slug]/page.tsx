import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { getCommunityBySlug, getCommunityListings } from "@/lib/data/communities"
import { ListingCard } from "@/components/listing/ListingCard"
import Link from "next/link"
import { Building2, Plus, Users } from "lucide-react"
import { db } from "@/lib/db"
import type { ListingWithDetails } from "@/types/listing"
import type { ListingCondition, ListingStatus } from "@prisma/client"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)
  if (!community) return {}
  return { title: `${community.name} — Kloop` }
}

export default async function CommunityFeedPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  const community = await getCommunityBySlug(slug, session?.user?.id)
  if (!community) notFound()

  if (!community.isMember) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <CommunityHeader community={community} showActions={false} />
        <div className="mt-8 text-center py-12 bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5">
          <Building2 size={40} className="mx-auto text-gray-200 dark:text-white/10 mb-3" />
          <p className="font-bold text-[var(--foreground)] mb-1">Acesso restrito</p>
          <p className="text-sm text-gray-500 dark:text-sage">Esta comunidade é exclusiva para membros.</p>
        </div>
      </div>
    )
  }

  const [communityListings, favoriteIds] = await Promise.all([
    getCommunityListings(community.id),
    session?.user?.id
      ? db.favorite
          .findMany({ where: { userId: session.user.id }, select: { listingId: true } })
          .then((favs) => favs.map((f) => f.listingId))
      : Promise.resolve<string[]>([]),
  ])

  const listings: ListingWithDetails[] = communityListings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    priceCents: l.priceCents,
    condition: l.condition as ListingCondition,
    status: l.status as ListingStatus,
    brand: l.brand,
    size: l.size,
    isTurbinado: l.isTurbinado,
    viewsCount: l.viewsCount,
    _count: l._count,
    category: l.category,
    images: l.images,
    seller: l.seller as ListingWithDetails["seller"],
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <CommunityHeader community={community} showActions={true} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-[var(--foreground)]">
            {listings.length} {listings.length === 1 ? "anúncio" : "anúncios"}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="font-bold text-[var(--foreground)] mb-1">Nenhum anúncio ainda</p>
            <p className="text-sm text-gray-500 dark:text-sage mb-4">
              Ainda não há anúncios nesta comunidade. Seja o primeiro!
            </p>
            <Link
              href={`/create?community=${community.id}`}
              className="inline-flex items-center gap-2 bg-[var(--color-teal)] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[var(--color-emerald)] transition-colors"
            >
              <Plus size={16} />
              Criar anúncio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorited={favoriteIds.includes(listing.id)}
                minimal
                communityBadge={{ type: "named", name: community.name }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CommunityHeader({
  community,
  showActions,
}: {
  community: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    memberCount: number
  }
  showActions: boolean
}) {
  return (
    <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
      <div className="h-28 bg-gradient-to-br from-[var(--color-frosted)] to-[var(--color-celadon)] dark:from-[var(--color-emerald)] dark:to-[var(--color-pine)] flex items-center justify-center">
        {community.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={community.logoUrl} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 size={44} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)] opacity-50" />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="font-black text-[18px] text-[var(--foreground)]">{community.name}</h1>
            {community.description && (
              <p className="text-[13px] text-gray-500 dark:text-sage mt-1 leading-relaxed">
                {community.description}
              </p>
            )}
          </div>
          {showActions && (
            <Link
              href={`/create?community=${community.id}`}
              className="flex-shrink-0 flex items-center gap-1.5 bg-[var(--color-teal)] text-white text-[13px] font-bold px-4 py-2 rounded-full hover:bg-[var(--color-emerald)] transition-colors"
            >
              <Plus size={14} />
              Anunciar
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <Users size={14} className="text-gray-400 dark:text-sage" />
          <span className="text-[12px] text-gray-500 dark:text-sage">
            {community.memberCount} {community.memberCount === 1 ? "membro" : "membros"}
          </span>
        </div>
      </div>
    </div>
  )
}
