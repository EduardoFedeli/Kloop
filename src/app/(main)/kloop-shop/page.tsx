import { db } from '@/lib/db'
import { ListingStatus } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react'
import { ListingGrid } from '@/components/listing/ListingGrid'
import type { ListingWithDetails } from '@/types/listing'

export const dynamic = 'force-dynamic'

export default async function KloopShopPage() {
  const shopUser = await db.user.findUnique({
    where: { email: 'shop@kloop.com' },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      _count: { select: { listings: { where: { status: ListingStatus.ACTIVE } } } },
    },
  })

  const listings = shopUser
    ? await db.listing.findMany({
        where: { sellerId: shopUser.id, status: ListingStatus.ACTIVE },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true, altText: true } },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              addresses: { where: { isDefault: true }, select: { city: true, state: true }, take: 1 },
            },
          },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const activeCount = shopUser?._count.listings ?? 0

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-pine) 0%, var(--color-emerald) 60%, var(--color-teal) 100%)' }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="pt-4 pb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[13px]"
            >
              <ArrowLeft size={14} />
              voltar
            </Link>
          </div>

          <div className="pb-8 pt-2 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
              <ShoppingBag size={32} className="text-white" strokeWidth={1.5} />
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] font-black text-white leading-tight">Kloop Shop</h1>
                <span className="inline-flex items-center gap-1 bg-[var(--color-celadon)] text-[var(--color-pine)] text-[10px] font-black px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} strokeWidth={3} />
                  loja oficial
                </span>
              </div>
              <p className="text-[13px] text-white/60 mt-1">
                {activeCount} {activeCount === 1 ? 'produto disponível' : 'produtos disponíveis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="bg-[var(--color-frosted)] dark:bg-white/4 border border-gray-100 dark:border-white/5 rounded-2xl p-4">
          <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
            A Kloop Shop é a loja oficial do Kloop. Aqui você encontra peças curadas e selecionadas pela nossa equipe — com garantia de qualidade e entrega confiável.
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="text-gray-300 dark:text-white/15 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-[16px] font-black text-[var(--foreground)]">em breve</p>
            <p className="text-[13px] text-gray-400 dark:text-sage mt-1">
              estamos preparando os melhores produtos para você.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-[15px] font-black text-[var(--foreground)] mb-4">
              produtos disponíveis
            </h2>
            <ListingGrid listings={listings as ListingWithDetails[]} />
          </>
        )}
      </div>

    </div>
  )
}
