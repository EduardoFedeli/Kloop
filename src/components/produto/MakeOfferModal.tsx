'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'
import { createOffer } from '@/app/actions/offers'

type Props = {
  listingId: string
  listingPriceCents: number
  isOpen: boolean
  onClose: () => void
}

function parseCents(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  return parseInt(digits || '0', 10)
}

function formatBRL(raw: string): string {
  const cents = parseCents(raw)
  if (cents === 0) return ''
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function MakeOfferModal({ listingId, listingPriceCents, isOpen, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rawValue, setRawValue] = useState('')

  if (!isOpen) return null

  const priceCents = parseCents(rawValue)
  const isValid = priceCents >= 1 && priceCents <= listingPriceCents

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(e.target.value.replace(/\D/g, ''))
  }

  const handleSubmit = () => {
    if (!isValid) return
    startTransition(async () => {
      const result = await createOffer({ listingId, priceCents })
      if ('error' in result) {
        if (result.error === 'existing_active_offer' && 'existingOfferId' in result) {
          toast.error('você já tem uma oferta ativa.', {
            action: { label: 'ver oferta', onClick: () => router.push(`/ofertas/${result.existingOfferId}`) },
          })
          onClose()
          return
        }
        const msgs: Record<string, string> = {
          cannot_offer_own_listing: 'você não pode ofertar no próprio anúncio.',
          listing_not_available: 'este anúncio não está mais disponível.',
          offers_not_accepted: 'este anúncio não aceita ofertas.',
          price_above_listing: 'valor não pode ser maior que o preço do anúncio.',
          buyer_address_required: 'adicione um endereço antes de ofertar.',
        }
        toast.error(msgs[result.error] ?? 'erro ao criar oferta, tente novamente.')
        return
      }
      if (result.autoAccepted && result.transactionId) {
        toast.success('oferta aceita automaticamente! finalize a compra.')
        onClose()
        router.push(`/checkout/${result.transactionId}`)
        return
      }
      toast.success('oferta enviada!')
      onClose()
      router.push(`/ofertas/${result.offerId}`)
    })
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[var(--color-pine)] w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-black text-[var(--foreground)]">fazer uma oferta</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-[13px] text-gray-500 dark:text-sage">
          preço pedido:{' '}
          <span className="font-bold text-[var(--foreground)]">{formatPrice(listingPriceCents)}</span>
        </p>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[var(--foreground)]">sua oferta</label>
          <div className={cn(
            "flex items-center gap-2 border-2 rounded-xl px-4 py-3 transition-colors",
            priceCents > listingPriceCents
              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-gray-200 dark:border-white/15 focus-within:border-[var(--color-teal)]"
          )}>
            <span className="text-[15px] font-bold text-gray-400">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatBRL(rawValue)}
              onChange={handleInput}
              placeholder="0,00"
              className="flex-1 bg-transparent text-[16px] font-bold text-[var(--foreground)] outline-none placeholder:text-gray-300 dark:placeholder:text-white/20"
            />
          </div>
          {priceCents > listingPriceCents && (
            <p className="text-[12px] font-bold text-red-500">
              ⚠ oferta não pode ser maior que o preço do anúncio ({formatPrice(listingPriceCents)}).
            </p>
          )}
        </div>

        <p className="text-[12px] text-gray-400 dark:text-sage leading-relaxed">
          o vendedor tem 24h pra responder. você pode negociar em até 4 rodadas.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/15 text-[14px] font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={cn(
              'flex-1 py-3 rounded-2xl text-[14px] font-black text-white transition-colors flex items-center justify-center gap-2',
              isValid && !isPending
                ? 'bg-[var(--color-teal)] hover:opacity-90'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed',
            )}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : 'enviar oferta'}
          </button>
        </div>
      </div>
    </div>
  )
}
