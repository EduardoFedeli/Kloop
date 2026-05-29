import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ListingCard } from '@/components/listing/ListingCard'
import type { ListingWithDetails } from '@/types/listing'

export const dynamic = 'force-dynamic'

const LISTING_SELECT = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: { displayOrder: 'asc' as const },
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
} as const

export default async function HistoricoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  // 1. Busca o histórico real do usuário logado
  const historyRecords = await db.viewHistory.findMany({
    where: { 
      userId: session.user.id,
      // Só traz o histórico se o anúncio ainda estiver ativo (evita mostrar coisa deletada/vendida)
      listing: { status: 'ACTIVE' } 
    },
    orderBy: { viewedAt: 'desc' }, // Mais recentes no topo
    take: 30, // Limite de 30 itens que combinamos
    include: {
      listing: {
        include: LISTING_SELECT
      }
    }
  })

  // 2. Extrai o produto de dentro do registro de histórico
  const listings = historyRecords.map((record) => record.listing) as unknown as ListingWithDetails[]

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
        <span className="text-7xl select-none">👁️</span>
        <div className="space-y-2">
          <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">ainda nada por aqui</h3>
          <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
            os produtos que você visitar aparecerão aqui.
          </p>
        </div>
        <Link
          href="/search"
          className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
        >
          explorar produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} variant="search" />
      ))}
    </div>
  )
}