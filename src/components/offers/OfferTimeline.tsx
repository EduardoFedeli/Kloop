'use client'

import Image from 'next/image'
import { formatPrice, timeAgo } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

type Round = {
  id: string
  roundNumber: number
  proposedBy: string
  priceCents: number
  createdAt: Date
}

type UserInfo = {
  id: string
  name: string
  avatarUrl: string | null
}

type Props = {
  rounds: Round[]
  buyer: UserInfo
  seller: UserInfo
}

function Avatar({ user }: { user: UserInfo }) {
  const initials = user.name.substring(0, 2).toUpperCase()
  return user.avatarUrl ? (
    <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

export function OfferTimeline({ rounds, buyer, seller }: Props) {
  return (
    <div className="space-y-3">
      {rounds.map((round) => {
        const proposer = round.proposedBy === buyer.id ? buyer : seller
        const recipient = round.proposedBy === buyer.id ? seller : buyer
        const isBuyer = round.proposedBy === buyer.id

        return (
          <div key={round.id} className={`flex items-start gap-3 ${isBuyer ? 'flex-row' : 'flex-row-reverse'}`}>
            <Avatar user={proposer} />
            <div className={`flex-1 rounded-2xl px-4 py-3 space-y-1 ${isBuyer ? 'bg-[var(--color-teal)]/10 dark:bg-[var(--color-teal)]/15' : 'bg-gray-100 dark:bg-white/8'}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] font-bold text-[var(--foreground)]">{proposer.name.toLowerCase()}</span>
                <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-[12px] text-gray-400 dark:text-sage">{recipient.name.toLowerCase()}</span>
              </div>
              <p className={`text-[17px] font-black ${isBuyer ? 'text-[var(--color-teal)]' : 'text-[var(--foreground)]'}`}>
                {formatPrice(round.priceCents)}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-sage">{timeAgo(round.createdAt)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
