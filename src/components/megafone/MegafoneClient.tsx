'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Megaphone, Zap, ShoppingCart, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import { applyMegafoneAction, buyExtraMegaphonesAction } from '@/lib/actions/megafone'

type Listing = {
  id: string
  title: string
  slug: string
  priceCents: number
  createdAt: Date
  isMegafonado: boolean
  megafonadoUntil: Date | null
  images: { url: string }[]
}

type Quota = {
  planAvailable: number
  extraBalance: number
  totalAvailable: number
  resetAt: Date | null
  megaphonesPerWeek: number
  usedThisWeek: number
}

type Props = {
  listings: Listing[]
  quota: Quota
  planName: string
}

function ageInDays(createdAt: Date) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
}

function requiredDiscount(priceCents: number, days: number) {
  if (days >= 29) return Math.min(Math.round(priceCents * 0.1), 5000)
  if (days >= 8) return Math.min(Math.round(priceCents * 0.05), 5000)
  return 0
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function MegafoneClient({ listings, quota, planName }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [overridePriceCents, setOverridePriceCents] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isBuying, startBuyTransition] = useTransition()

  const activeListing = listings.find((l) => l.id === selectedId)

  function handleSelect(listing: Listing) {
    const days = ageInDays(listing.createdAt)
    const disc = requiredDiscount(listing.priceCents, days)
    setSelectedId(listing.id)
    setOverridePriceCents(disc > 0 ? listing.priceCents - disc : null)
  }

  function handleApply() {
    if (!selectedId) return
    startTransition(async () => {
      const result = await applyMegafoneAction(
        selectedId,
        overridePriceCents ?? undefined
      )
      if (result.success) {
        toast.success('Megafone aplicado! Anúncio em destaque por 7 dias. 📣')
        setSelectedId(null)
        setOverridePriceCents(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleBuyExtra() {
    startBuyTransition(async () => {
      const result = await buyExtraMegaphonesAction()
      if (result.success) {
        toast.success('+5 megafones adicionados à sua conta!')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Quota card */}
      <div className="rounded-2xl border border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-yellow-500" />
            <span className="text-[13px] font-black text-yellow-700 dark:text-yellow-400">
              seus megafones
            </span>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-sage font-medium">plano {planName}</span>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <p className="text-[32px] font-black leading-none text-yellow-600 dark:text-yellow-400">
              {quota.totalAvailable}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5">disponíveis</p>
          </div>
          <div className="flex-1 space-y-1 pb-1">
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-sage">
              <span>plano semanal</span>
              <span>{quota.planAvailable} de {quota.megaphonesPerWeek}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 dark:bg-yellow-500 rounded-full transition-all"
                style={{
                  width: `${quota.megaphonesPerWeek > 0
                    ? Math.round((quota.planAvailable / quota.megaphonesPerWeek) * 100)
                    : 0}%`,
                }}
              />
            </div>
            {quota.resetAt && (
              <p className="text-[10px] text-gray-400 dark:text-sage flex items-center gap-1">
                <RefreshCw size={9} />
                reset em {formatDate(quota.resetAt)}
              </p>
            )}
          </div>
        </div>

        {quota.extraBalance > 0 && (
          <p className="mt-2 text-[11px] text-yellow-700 dark:text-yellow-400 font-medium">
            +{quota.extraBalance} extra{quota.extraBalance > 1 ? 's' : ''} disponíve{quota.extraBalance > 1 ? 'is' : 'l'}
          </p>
        )}

        <button
          onClick={handleBuyExtra}
          disabled={isBuying}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-yellow-400 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-400 text-[12px] font-bold hover:bg-yellow-100 dark:hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
        >
          <ShoppingCart size={13} />
          {isBuying ? 'aguarde...' : 'comprar +5 megafones · R$ 10,00'}
        </button>
      </div>

      {/* Listing picker */}
      <div>
        <h2 className="text-[13px] font-black text-[var(--foreground)] mb-3">
          escolha um anúncio para megafonar
        </h2>

        {listings.length === 0 ? (
          <p className="text-[13px] text-gray-400 dark:text-sage text-center py-8">
            você não tem anúncios ativos.
          </p>
        ) : (
          <div className="space-y-2">
            {listings.map((listing) => {
              const days = ageInDays(listing.createdAt)
              const disc = requiredDiscount(listing.priceCents, days)
              const isSelected = selectedId === listing.id
              const isMegafonado =
                listing.isMegafonado &&
                listing.megafonadoUntil !== null &&
                new Date(listing.megafonadoUntil) > new Date()

              return (
                <button
                  key={listing.id}
                  onClick={() => !isMegafonado && handleSelect(listing)}
                  disabled={!!isMegafonado}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all',
                    isMegafonado
                      ? 'border-yellow-300 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/5 opacity-70 cursor-default'
                      : isSelected
                      ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 ring-1 ring-yellow-400 dark:ring-yellow-500'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-yellow-300 dark:hover:border-yellow-500/40'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-white/10" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[var(--foreground)] truncate">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[12px] text-gray-500 dark:text-sage">
                        {formatPrice(listing.priceCents)}
                      </span>
                      {disc > 0 && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                          {days >= 29 ? '-10% obrig.' : '-5% obrig.'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isMegafonado ? (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                      <Megaphone size={14} />
                      <span className="text-[11px] font-black">ativo até {listing.megafonadoUntil ? formatDate(listing.megafonadoUntil) : ''}</span>
                    </div>
                  ) : isSelected ? (
                    <Check size={16} className="text-yellow-500 flex-shrink-0" />
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm panel */}
      {selectedId && activeListing && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            <p className="text-[13px] font-black text-[var(--foreground)]">confirmar megafone</p>
          </div>

          {(() => {
            const days = ageInDays(activeListing.createdAt)
            const disc = requiredDiscount(activeListing.priceCents, days)
            if (disc <= 0) return null
            return (
              <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-orange-700 dark:text-orange-400">
                    Este anúncio tem {days} dias. Para megafonar, é necessário reduzir o preço em{' '}
                    {days >= 29 ? '10%' : '5%'} (máx. R$ 50,00).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-gray-500 dark:text-sage">novo preço:</span>
                  <span className="text-[14px] font-black text-[var(--foreground)]">
                    {formatPrice(overridePriceCents ?? activeListing.priceCents - disc)}
                  </span>
                  <span className="text-[11px] text-gray-400 line-through">
                    {formatPrice(activeListing.priceCents)}
                  </span>
                </div>
              </div>
            )
          })()}

          <ul className="text-[12px] text-gray-500 dark:text-sage space-y-1">
            <li>· destaque no feed por <strong>7 dias</strong></li>
            <li>· aparece no topo das buscas da categoria</li>
            <li>· 1 megafone será descontado do seu saldo</li>
          </ul>

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedId(null); setOverridePriceCents(null) }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-500 dark:text-sage hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={isPending || quota.totalAvailable <= 0}
              className="flex-1 py-2.5 rounded-xl bg-yellow-400 dark:bg-yellow-500 text-white text-[13px] font-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Megaphone size={14} />
              {isPending ? 'aplicando...' : 'megafonar!'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
