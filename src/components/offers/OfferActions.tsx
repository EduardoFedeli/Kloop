'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'
import { respondOffer } from '@/app/actions/offers'

type Props = {
  offerId: string
  role: 'buyer' | 'seller'
  status: 'PENDING_BUYER' | 'PENDING_SELLER'
  listingPriceCents: number
  currentPriceCents: number
  roundsCount: number
  maxRounds: number
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

export function OfferActions({
  offerId,
  role,
  status,
  listingPriceCents,
  currentPriceCents,
  roundsCount,
  maxRounds,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'idle' | 'counter'>('idle')
  const [rawCounter, setRawCounter] = useState('')

  const isMyTurn =
    (role === 'buyer' && status === 'PENDING_BUYER') ||
    (role === 'seller' && status === 'PENDING_SELLER')

  const canCounter = roundsCount < maxRounds

  const counterCents = parseCents(rawCounter)
  // Seller must counter ABOVE buyer's offer (wants more money, up to listing price)
  // Buyer must counter BELOW seller's last counter (wants to pay less)
  const isCounterValid =
    counterCents >= 1 &&
    counterCents <= listingPriceCents &&
    (role === 'seller'
      ? counterCents > currentPriceCents
      : counterCents < currentPriceCents)

  const act = (action: 'ACCEPT' | 'REJECT' | 'COUNTER') => {
    startTransition(async () => {
      const result = await respondOffer({
        offerId,
        action,
        ...(action === 'COUNTER' ? { counterPriceCents: counterCents } : {}),
      })

      if ('error' in result) {
        const msgs: Record<string, string> = {
          offer_expired: 'esta oferta expirou.',
          not_your_turn: 'não é a sua vez.',
          max_rounds_reached: 'limite de rodadas atingido.',
          buyer_address_required: 'o comprador precisa de um endereço cadastrado.',
          listing_not_available: 'anúncio não está mais disponível.',
          price_above_listing: 'valor não pode ser maior que o preço do anúncio.',
          counter_must_be_above_current: 'sua contra-proposta deve ser maior que a oferta do comprador.',
          counter_must_be_below_current: 'sua contra-proposta deve ser menor que a oferta do vendedor.',
        }
        toast.error(msgs[result.error] ?? 'erro ao responder oferta.')
        return
      }

      if (action === 'ACCEPT' && result.transactionId) {
        toast.success('oferta aceita! redirecionando para o pagamento...')
        router.push(`/checkout/${result.transactionId}`)
        return
      }

      if (action === 'ACCEPT') {
        toast.success('oferta aceita!')
      } else if (action === 'REJECT') {
        toast.info('oferta recusada.')
      } else {
        toast.success('contra-proposta enviada!')
        setMode('idle')
        setRawCounter('')
      }

      router.refresh()
    })
  }

  if (!isMyTurn) {
    return (
      <div className="text-center py-6 px-4">
        <p className="text-[13px] text-gray-400 dark:text-sage">
          {role === 'buyer'
            ? 'aguardando o vendedor responder...'
            : 'aguardando o comprador responder...'}
        </p>
      </div>
    )
  }

  if (mode === 'counter') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[var(--foreground)]">sua contra-proposta</label>
          <p className="text-[12px] text-gray-400 dark:text-sage">
            {role === 'seller'
              ? <>oferta do comprador: <span className="font-bold">{formatPrice(currentPriceCents)}</span> · preço original: <span className="font-bold">{formatPrice(listingPriceCents)}</span></>
              : <>contra-proposta do vendedor: <span className="font-bold">{formatPrice(currentPriceCents)}</span></>
            }
          </p>
          <div className="flex items-center gap-2 border-2 border-gray-200 dark:border-white/15 rounded-xl px-4 py-3 focus-within:border-[var(--color-teal)] transition-colors">
            <span className="text-[15px] font-bold text-gray-400">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatBRL(rawCounter)}
              onChange={(e) => setRawCounter(e.target.value.replace(/\D/g, ''))}
              placeholder="0,00"
              autoFocus
              className="flex-1 bg-transparent text-[16px] font-bold text-[var(--foreground)] outline-none placeholder:text-gray-300 dark:placeholder:text-white/20"
            />
          </div>
          {counterCents > 0 && role === 'seller' && counterCents <= currentPriceCents && (
            <p className="text-[12px] text-red-500">
              sua contra-proposta deve ser maior que a oferta do comprador ({formatPrice(currentPriceCents)}).
            </p>
          )}
          {counterCents > 0 && role === 'seller' && counterCents > listingPriceCents && (
            <p className="text-[12px] text-red-500">
              não pode ser maior que o preço original ({formatPrice(listingPriceCents)}).
            </p>
          )}
          {counterCents > 0 && role === 'buyer' && counterCents >= currentPriceCents && (
            <p className="text-[12px] text-red-500">
              sua contra-proposta deve ser menor que a oferta do vendedor ({formatPrice(currentPriceCents)}).
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setMode('idle'); setRawCounter('') }}
            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/15 text-[14px] font-bold text-gray-500"
          >
            voltar
          </button>
          <button
            onClick={() => act('COUNTER')}
            disabled={!isCounterValid || isPending}
            className={cn(
              'flex-1 py-3 rounded-2xl text-[14px] font-black text-white flex items-center justify-center gap-2',
              isCounterValid && !isPending
                ? 'bg-[var(--color-teal)] hover:opacity-90'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed',
            )}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : 'enviar contra-proposta'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => act('ACCEPT')}
        disabled={isPending}
        className="w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : 'aceitar oferta ✓'}
      </button>

      <div className="flex gap-3">
        {canCounter && (
          <button
            onClick={() => setMode('counter')}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-teal)] text-[var(--color-teal)] text-[14px] font-bold hover:bg-[var(--color-teal)]/5"
          >
            contra-proposta
          </button>
        )}
        <button
          onClick={() => act('REJECT')}
          disabled={isPending}
          className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/15 text-[14px] font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          recusar
        </button>
      </div>

      {!canCounter && (
        <p className="text-[11px] text-center text-gray-400 dark:text-sage">
          limite de {maxRounds} rodadas atingido — apenas aceitar ou recusar.
        </p>
      )}
    </div>
  )
}
