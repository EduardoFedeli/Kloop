"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { ListingCard } from '@/components/listing/ListingCard'
import type { ListingWithDetails } from '@/types/listing'

type Seller = { id: string; name: string; avatarUrl: string | null }

type Props = {
  followedSellers: Seller[]
  feedLojinhas: ListingWithDetails[]
  favoriteIds: string[]
}

export function LojinhasClient({ followedSellers, feedLojinhas, favoriteIds }: Props) {
  const [showFollowingList, setShowFollowingList] = useState(false)
  const favoriteSet = new Set(favoriteIds)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[16px] font-black text-[var(--foreground)]">novidades das lojinhas</h2>
        <button
          onClick={() => setShowFollowingList((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-3 py-1.5 rounded-full"
        >
          <Users size={14} /> quem eu sigo ({followedSellers.length})
        </button>
      </div>

      {showFollowingList && (
        <div className="bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm mb-6 animate-in slide-in-from-top-2">
          <h3 className="text-[13px] font-bold text-gray-500 dark:text-sage mb-3">você segue estas lojinhas:</h3>
          {followedSellers.length === 0 ? (
            <p className="text-[12px] text-gray-400">você ainda não segue ninguém.</p>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-2 [&::-webkit-scrollbar]:hidden">
              {followedSellers.map((seller) => (
                <Link key={seller.id} href={`/profile/${seller.id}`} className="flex flex-col items-center flex-shrink-0 w-16 group">
                  {seller.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seller.avatarUrl}
                      className="w-12 h-12 rounded-full object-cover border border-transparent group-hover:border-[var(--color-teal)] transition"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white font-bold text-sm">
                      {seller.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-[var(--foreground)] mt-1 text-center truncate w-full">
                    {seller.name.split(' ')[0]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {feedLojinhas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
          <span className="text-7xl select-none">🏪</span>
          <div className="space-y-2">
            <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">seu feed está vazio</h3>
            <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
              siga suas lojinhas favoritas e fique de olho nas novidades que elas publicarem.
            </p>
          </div>
          <Link
            href="/"
            className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
          >
            explorar vendedores
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 gap-y-5">
          {feedLojinhas.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              isFavorited={favoriteSet.has(listing.id)} 
              variant="search" 
              showSeller={true} 
            />
          ))}
        </div>
      )}
    </div>
  )
}