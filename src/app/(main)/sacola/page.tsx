'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Trash2, Tag, X, ChevronLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import type { CartItem } from '@/store/cart'

type SellerGroup = {
  sellerId: string
  sellerName: string
  items: CartItem[]
}

function BundleOfferModal({
  group,
  onClose,
  onSuccess,
}: {
  group: SellerGroup
  onClose: () => void
  onSuccess: (sellerId: string) => void
}) {
  const total = group.items.reduce((s, i) => s + i.priceCents, 0)
  const [offerCents, setOfferCents] = useState(total)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInput = (raw: string) => {
    const sanitized = raw.replace(',', '.').replace(/[^0-9.]/g, '')
    const parsed = parseFloat(sanitized)
    setOfferCents(isNaN(parsed) ? 0 : Math.round(parsed * 100))
  }

  const handleSubmit = async () => {
    if (offerCents <= 0) {
      setError('Informe um valor válido.')
      return
    }
    // TRAVA NO FRONTEND: Não deixa ser maior OU IGUAL ao total
    if (offerCents >= total) {
      setError('A oferta deve ser menor que o valor original do lote.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bundle-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: group.sellerId,
          items: group.items.map((i) => ({ listingId: i.listingId, priceCents: i.priceCents })),
          offerTotalCents: offerCents,
        }),
      })
      const data = (await res.json()) as { bundleOfferId?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar oferta.')
      toast.success('Oferta enviada! Aguarde a resposta do vendedor.')
      onSuccess(group.sellerId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar oferta.')
    } finally {
      setLoading(false)
    }
  }

  const reductionPercent = total > 0 && offerCents < total
    ? Math.round(((total - offerCents) / total) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[var(--color-pine)] rounded-t-3xl p-6 space-y-5 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[var(--foreground)]">fazer oferta pelo lote</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[var(--foreground)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[13px] text-gray-500 dark:text-sage">
            itens de <span className="font-bold text-[var(--foreground)]">{group.sellerName.toLowerCase()}</span>
          </p>
          {group.items.map((item) => (
            <div key={item.listingId} className="flex items-center justify-between text-[13px]">
              <span className="text-[var(--foreground)] truncate max-w-[200px]">{item.title.toLowerCase()}</span>
              <span className="text-gray-500 dark:text-sage font-medium">{formatPrice(item.priceCents)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-[14px] font-bold text-[var(--foreground)] pt-2 border-t border-gray-100 dark:border-white/10">
            <span>total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-gray-500 dark:text-sage block">sua oferta pelo lote</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-400">R$</span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              defaultValue={(total / 100).toFixed(2)}
              onChange={(e) => handleInput(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3.5 rounded-2xl border bg-transparent text-[16px] font-bold text-[var(--foreground)] outline-none transition-colors",
                offerCents >= total ? "border-red-400 focus:border-red-500" : "border-gray-200 dark:border-white/20 focus:border-[var(--color-teal)]"
              )}
            />
          </div>
          {reductionPercent > 0 && (
            <p className="text-[12px] text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-medium pl-1">
              {reductionPercent}% de desconto sobre o total
            </p>
          )}
          {offerCents >= total && (
            <p className="text-[12px] text-red-500 font-medium pl-1">
              a oferta deve ser menor que {formatPrice(total)}
            </p>
          )}
        </div>

        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}

        <button
          onClick={() => void handleSubmit()}
          disabled={loading || offerCents <= 0 || offerCents >= total}
          className="w-full py-4 bg-[var(--color-teal)] text-white text-[15px] font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'enviando...' : `enviar oferta de ${offerCents > 0 ? formatPrice(offerCents) : '—'}`}
        </button>
      </div>
    </div>
  )
}

export default function SacolaPage() {
  const router = useRouter()
  const { items, removeItem, clearSeller } = useCartStore()
  const [offerGroup, setOfferGroup] = useState<SellerGroup | null>(null)
  
  // Estado para os checkboxes dos itens na sacola
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const groups: SellerGroup[] = Object.values(
    items.reduce<Record<string, SellerGroup>>((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = { sellerId: item.sellerId, sellerName: item.sellerName, items: [] }
      }
      acc[item.sellerId].items.push(item)
      return acc
    }, {})
  )

  const handleOfferSuccess = (sellerId: string) => {
    clearSeller(sellerId)
    setOfferGroup(null)
  }

  const toggleSelection = (listingId: string) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(listingId)) {
      newSet.delete(listingId)
    } else {
      newSet.add(listingId)
    }
    setSelectedItems(newSet)
  }

  // Lógica de finalização de compra (Mock para o MVP)
  const handleCheckoutMock = () => {
    toast.success('Compra dos itens selecionados foi concluída! (Simulação do MVP)')
    
    // Remove os itens comprados da sacola
    items.forEach((item) => {
      if (selectedItems.has(item.listingId)) {
        removeItem(item.listingId)
      }
    })
    
    setSelectedItems(new Set())
  }

  // Soma o total de centavos baseados apenas nos selecionados
  const selectedTotalCents = items
    .filter((item) => selectedItems.has(item.listingId))
    .reduce((sum, item) => sum + item.priceCents, 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-24">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--foreground)]">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-black text-[var(--foreground)]">sacola</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <ShoppingBag size={28} className="text-gray-300 dark:text-sage/30" />
          </div>
          <p className="text-[16px] font-bold text-[var(--foreground)]">sua sacola está vazia</p>
          <p className="text-[13px] text-gray-400 dark:text-sage">
            adicione produtos para comprar ou fazer ofertas em lote
          </p>
          <Link
            href="/"
            className="mt-2 px-6 py-3 bg-[var(--color-teal)] text-white text-[14px] font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            explorar produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {offerGroup && (
        <BundleOfferModal
          group={offerGroup}
          onClose={() => setOfferGroup(null)}
          onSuccess={handleOfferSuccess}
        />
      )}

      {/* pb-36 adicionado para evitar que o conteúdo suma atrás da barra inferior fixa de checkout */}
      <div className="min-h-screen bg-[var(--background)] pb-36">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--foreground)]">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-black text-[var(--foreground)]">sacola</h1>
          <span className="text-[13px] text-gray-400 dark:text-sage ml-auto">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">
          {groups.map((group) => {
            const groupTotal = group.items.reduce((s, i) => s + i.priceCents, 0)
            return (
              <div
                key={group.sellerId}
                className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm"
              >
                {/* Seller header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                  <p className="text-[13px] font-bold text-[var(--foreground)]">
                    {group.sellerName.toLowerCase()}
                  </p>
                  <span className="text-[12px] text-gray-400 dark:text-sage">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Items list */}
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {group.items.map((item) => (
                    <div key={item.listingId} className="flex items-center gap-3 px-4 py-4">
                      {/* Checkbox de seleção */}
                      <button
                        onClick={() => toggleSelection(item.listingId)}
                        className={cn(
                          "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          selectedItems.has(item.listingId)
                            ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white"
                            : "border-gray-300 dark:border-white/20 bg-white dark:bg-transparent"
                        )}
                      >
                        {selectedItems.has(item.listingId) && <Check size={12} strokeWidth={4} />}
                      </button>

                      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 relative">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/listing/${item.slug}`}>
                          <p className="text-[13px] font-bold text-[var(--foreground)] truncate hover:underline">
                            {item.title.toLowerCase()}
                          </p>
                        </Link>
                        <p className="text-[13px] text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-bold mt-0.5">
                          {formatPrice(item.priceCents)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.listingId)
                          // Se apagar o item da sacola, removemos da seleção também
                          if (selectedItems.has(item.listingId)) {
                            const newSet = new Set(selectedItems)
                            newSet.delete(item.listingId)
                            setSelectedItems(newSet)
                          }
                        }}
                        className="text-gray-300 dark:text-sage/50 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Group footer */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-500 dark:text-sage font-medium">total do lote</span>
                    <span className="font-black text-[var(--foreground)]">{formatPrice(groupTotal)}</span>
                  </div>
                  <button
                    onClick={() => setOfferGroup(group)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--color-teal)] dark:border-[var(--color-celadon)] text-[var(--color-teal)] dark:text-[var(--color-celadon)] text-[13px] font-bold hover:bg-[var(--color-teal)]/5 transition-colors"
                  >
                    <Tag size={14} />
                    fazer oferta pelo lote
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Bottom Bar fixa de Checkout simulado - Estilo Flutuante */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-[80px] left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-5">
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-[24px] p-3 shadow-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex flex-col pl-3">
              <span className="text-[12px] text-gray-500 dark:text-sage font-medium leading-none mb-1">
                total ({selectedItems.size} {selectedItems.size === 1 ? 'item' : 'itens'})
              </span>
              <span className="text-[18px] font-black text-[var(--foreground)] leading-none">
                {formatPrice(selectedTotalCents)}
              </span>
            </div>
            <button
              onClick={handleCheckoutMock}
              className="px-6 py-3.5 bg-[var(--color-teal)] text-white text-[15px] font-black rounded-[18px] hover:opacity-90 transition-opacity"
            >
              finalizar compra
            </button>
          </div>
        </div>
      )}
    </>
  )
}