'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, MessageCircle, Tag, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { startConversation } from '@/app/actions/chat'
import { MakeOfferModal } from '@/components/produto/MakeOfferModal'
import { useCartStore } from '@/store/cart'
import type { ListingStatus } from '@prisma/client'

type Props = {
  listingId: string
  listingSlug: string
  listingTitle: string
  listingPriceCents: number
  listingImageUrl?: string | null
  listingStatus: ListingStatus
  currentUserId?: string
  sellerId?: string
  sellerName?: string
  buyerHasAddress?: boolean
  chatOnly?: boolean
  acceptsOffers?: boolean
}

export function ProductActions({
  listingId,
  listingSlug,
  listingTitle,
  listingPriceCents,
  listingImageUrl,
  listingStatus,
  currentUserId,
  sellerId,
  sellerName,
  buyerHasAddress,
  chatOnly = false,
  acceptsOffers = true,
}: Props) {
  const router = useRouter()
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const isAvailable = listingStatus === 'ACTIVE'
  const { addItem, hasItem } = useCartStore()
  const inCart = hasItem(listingId)

  const handleAddToCart = () => {
    if (!currentUserId) {
      router.push(`/login?redirectTo=/listing/${listingSlug}`)
      return
    }
    addItem({
      listingId,
      slug: listingSlug,
      title: listingTitle,
      priceCents: listingPriceCents,
      imageUrl: listingImageUrl ?? null,
      sellerId: sellerId ?? '',
      sellerName: sellerName ?? '',
    })
    toast.success('Adicionado à sacola!', {
      action: { label: 'ver sacola', onClick: () => router.push('/sacola') },
    })
  }

  const handleChat = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    setIsStartingChat(true)
    const result = await startConversation(listingId)
    setIsStartingChat(false)
    if ('error' in result) {
      const msgs: Record<string, string> = {
        listing_not_available: 'Este anúncio não está mais disponível.',
        cannot_chat_with_self: 'Você não pode conversar consigo mesmo.',
      }
      toast.error(msgs[result.error] ?? 'Erro ao iniciar conversa.')
      return
    }
    router.push(`/chat/${result.conversationId}`)
  }

  // Inline mode — used inside "faça sua pergunta" section
  if (chatOnly) {
    return (
      <button
        onClick={() => void handleChat()}
        disabled={isStartingChat || !isAvailable}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors',
          isAvailable && !isStartingChat
            ? 'border border-teal dark:border-celadon text-teal dark:text-celadon hover:bg-teal hover:text-white dark:hover:bg-celadon dark:hover:text-forest'
            : 'border border-gray-200 text-gray-300 cursor-not-allowed',
        )}
      >
        <MessageCircle size={16} />
        {isStartingChat ? 'aguarde...' : 'enviar mensagem'}
      </button>
    )
  }

  const handleBuy = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    if (buyerHasAddress === false) {
      toast.error('Adicione um endereço antes de comprar.')
      return
    }
    setIsBuying(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = (await res.json()) as { transactionId?: string; error?: string }
      if (!res.ok || !data.transactionId) {
        toast.error(data.error ?? 'Erro ao iniciar compra.')
        return
      }
      router.push(`/checkout/${data.transactionId}`)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setIsBuying(false)
    }
  }

  const handleOfferClick = () => {
    if (!currentUserId) {
      router.push(`/login?redirectTo=/listing/${listingSlug}`)
      return
    }
    if (buyerHasAddress === false) {
      toast.error('Adicione um endereço antes de ofertar.')
      return
    }
    setOfferModalOpen(true)
  }

  // Fixed bottom bar mode
  return (
    <>
      <MakeOfferModal
        listingId={listingId}
        listingPriceCents={listingPriceCents}
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-pine border-t border-gray-100 dark:border-forest px-4 py-3 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto space-y-2">
        <button
          disabled={!isAvailable || isBuying}
          onClick={() => void handleBuy()}
          className={cn(
            'w-full py-3.5 rounded-2xl text-base font-black transition-opacity flex items-center justify-center gap-2',
            isAvailable && !isBuying
              ? 'bg-teal dark:bg-emerald text-white hover:opacity-90'
              : 'bg-gray-200 dark:bg-emerald/20 text-gray-400 cursor-not-allowed',
          )}
        >
          {isBuying ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isAvailable ? (
            'eu quero! 💚'
          ) : (
            'produto indisponível'
          )}
        </button>

        {isAvailable && (
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border text-sm font-bold transition-colors',
                inCart
                  ? 'border-teal bg-teal/10 text-teal dark:border-celadon dark:bg-celadon/10 dark:text-celadon'
                  : 'border-teal dark:border-celadon text-teal dark:text-celadon hover:bg-teal/5'
              )}
            >
              {inCart ? <Check size={15} /> : <ShoppingBag size={15} />}
              {inCart ? 'na sacola' : 'adicionar à sacola'}
            </button>
            {acceptsOffers && (
              <button
                onClick={handleOfferClick}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-teal dark:border-celadon text-teal dark:text-celadon text-sm font-bold hover:bg-teal/5 transition-colors"
              >
                <Tag size={15} />
                fazer oferta
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
