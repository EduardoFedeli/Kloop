'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ListingCondition } from '@prisma/client'
import { Search, X, LogIn, LogOut, SlidersHorizontal, ArrowUpDown, CheckCircle2, Smartphone, Zap, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import QRCode from 'qrcode'

// ── Types ──────────────────────────────────────────────────────

type TotemListing = {
  id: string
  title: string
  slug: string
  priceCents: number
  condition: ListingCondition
  size: string | null
  brandName: string | null
  categoryId: string
  categoryName: string
  categorySlug: string
  imageUrl: string | null
  sellerName: string
  unitNumber: string | null
}

type TotemCategory = { id: string; name: string; slug: string }

type Community = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  memberCount: number
}

type TotemUser = {
  id: string
  name: string
  hasAccess: boolean
}

type SortKey = 'newest' | 'price_asc' | 'price_desc'

type Props = {
  community: Community
  listings: TotemListing[]
  categories: TotemCategory[]
}

// ── Condition labels ───────────────────────────────────────────

const conditionLabel: Record<ListingCondition, string> = {
  NEW: 'novo',
  LIKE_NEW: 'seminovo',
  GOOD: 'bom estado',
  FAIR: 'usado',
}

const conditionColor: Record<ListingCondition, string> = {
  NEW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  LIKE_NEW: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  GOOD: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  FAIR: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

// ── QR Canvas component ────────────────────────────────────────

function QrCanvas({ value, size = 240 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#081C15', light: '#D8F3DC' },
    })
  }, [value, size])
  return <canvas ref={ref} className="rounded-2xl" />
}

// ── Unit number simulation ─────────────────────────────────────

function simulatedUnit(unitNumber: string | null, sellerName: string): string {
  if (unitNumber) return `Apto ${unitNumber}`
  const seed = sellerName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const block = String.fromCharCode(65 + (seed % 4))
  const num = 101 + (seed % 30)
  return `Apto ${block}${num}`
}

// ── Backdrop overlay ───────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
      onClick={onClick}
    />
  )
}

// ── Login overlay ──────────────────────────────────────────────

type LoginState = 'idle' | 'waiting' | 'success' | 'no_access'

function LoginOverlay({
  communityId,
  onSuccess,
  onClose,
}: {
  communityId: string
  onSuccess: (user: TotemUser) => void
  onClose: () => void
}) {
  const [state, setState] = useState<LoginState>('idle')
  const [token, setToken] = useState<string | null>(null)
  const [numericCode, setNumericCode] = useState<string | null>(null)
  const [qrValue, setQrValue] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const startLogin = useCallback(async () => {
    setState('waiting')
    const res = await fetch('/api/totem/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'erro desconhecido' })) as { error?: string }
      console.error('[totem] falha ao iniciar sessão:', errData.error)
      setState('idle')
      return
    }

    const data = await res.json() as { token: string; numericCode: string; authUrl: string }
    setToken(data.token)
    setNumericCode(data.numericCode)
    setQrValue(data.authUrl)
    setTimeLeft(60)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopPolling()
          setState('idle')
          return 0
        }
        return t - 1
      })
    }, 1000)

    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/totem/session/${data.token}`)
      const d = await r.json() as { status: string; user?: TotemUser }
      if (d.status === 'CONFIRMED') {
        stopPolling()
        if (d.user?.hasAccess) {
          setState('success')
          setTimeout(() => onSuccess(d.user!), 1200)
        } else {
          setState('no_access')
        }
      }
    }, 2000)
  }, [communityId, stopPolling, onSuccess])

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="relative bg-[var(--color-pine)] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={20} />
          </button>

          {state === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--color-teal)]/20 border border-[var(--color-teal)]/30 flex items-center justify-center mx-auto mb-5">
                <LogIn size={28} className="text-[var(--color-celadon)]" />
              </div>
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                entrar no kloop
              </h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                faça login com sua conta Kloop para comprar itens do condomínio
              </p>
              <button
                onClick={startLogin}
                className="w-full py-4 rounded-2xl bg-[var(--color-teal)] hover:bg-[var(--color-emerald)] active:scale-95 transition-all font-semibold text-white text-lg"
              >
                gerar QR de acesso
              </button>
            </>
          )}

          {state === 'waiting' && token && qrValue && numericCode && (
            <>
              <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                escaneie com o app Kloop
              </h2>
              <p className="text-white/50 text-sm mb-6">
                abra o Kloop no celular e aponte para o código
              </p>

              <div className="flex justify-center mb-5">
                <div className="p-3 bg-[var(--color-celadon)] rounded-2xl">
                  <QrCanvas value={qrValue} size={200} />
                </div>
              </div>

              <div className="mb-5">
                <p className="text-white/40 text-xs mb-2">ou use o código numérico no app</p>
                <div className="flex items-center justify-center gap-3">
                  {numericCode.match(/.{1,3}/g)?.map((chunk, i) => (
                    <span key={i} className="text-3xl font-black tracking-widest text-[var(--color-celadon)]">
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--color-teal)] animate-pulse" />
                aguardando confirmação · expira em {timeLeft}s
              </div>
            </>
          )}

          {state === 'success' && (
            <div className="py-4">
              <CheckCircle2 size={56} className="text-[var(--color-mint)] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                login realizado!
              </h2>
            </div>
          )}

          {state === 'no_access' && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <X size={28} className="text-red-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">sem acesso</h2>
              <p className="text-white/50 text-sm mb-6">
                sua conta não está vinculada a este condomínio. fale com o síndico.
              </p>
              <button
                onClick={() => setState('idle')}
                className="w-full py-3 rounded-2xl border border-white/15 hover:bg-white/5 transition-colors font-medium"
              >
                tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Purchase options overlay ───────────────────────────────────

function PurchaseOverlay({
  listing,
  onPixHere,
  onClose,
}: {
  listing: TotemListing
  onPixHere: () => void
  onClose: () => void
}) {
  const mobileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/listing/${listing.slug}`
    : `/listing/${listing.slug}`

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="relative bg-[var(--color-pine)] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors">
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold mb-1 text-center" style={{ fontFamily: 'var(--font-display)' }}>
            como quer comprar?
          </h2>
          <p className="text-white/40 text-sm text-center mb-7 truncate">{listing.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Opção: celular */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-teal)]/20 border border-[var(--color-teal)]/30 flex items-center justify-center">
                <Smartphone size={22} className="text-[var(--color-celadon)]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm mb-0.5">continuar no celular</p>
                <p className="text-white/40 text-xs">escaneie e finalize no seu app</p>
              </div>
              <div className="p-2 bg-[var(--color-celadon)] rounded-xl">
                <QrCanvas value={mobileUrl} size={140} />
              </div>
            </div>

            {/* Opção: PIX aqui */}
            <button
              onClick={onPixHere}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-4 hover:bg-[var(--color-teal)]/10 hover:border-[var(--color-teal)]/30 active:scale-95 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Zap size={22} className="text-amber-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm mb-0.5">pagar com PIX aqui</p>
                <p className="text-white/40 text-xs">escaneie com o app do banco</p>
              </div>
              <div className="mt-auto w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold text-center">
                {formatPrice(listing.priceCents)}
              </div>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            cancelar
          </button>
        </div>
      </div>
    </>
  )
}

// ── PIX overlay ────────────────────────────────────────────────

type PixState = 'waiting' | 'confirming' | 'success'

function PixOverlay({
  listing,
  communityId,
  userId,
  onSuccess,
  onClose,
}: {
  listing: TotemListing
  communityId: string
  userId: string
  onSuccess: () => void
  onClose: () => void
}) {
  const [pixState, setPixState] = useState<PixState>('waiting')
  const [txId, setTxId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pixPayload = `KLOOP-SIMULACAO-${listing.id.slice(-8).toUpperCase()}`

  useEffect(() => {
    let mounted = true
    fetch('/api/totem/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, communityId, userId }),
    })
      .then((r) => r.json())
      .then((d: { txId: string }) => { if (mounted) setTxId(d.txId) })
      .catch(() => { /* silently ignore checkout creation errors in simulation */ })

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); onClose(); return 0 }
        return t - 1
      })
    }, 1000)

    return () => {
      mounted = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [listing.id, communityId, userId, onClose])

  const confirmPayment = useCallback(async () => {
    if (!txId) return
    setPixState('confirming')
    await fetch(`/api/totem/checkout/${txId}/confirm`, { method: 'POST' })
    setPixState('success')
    setTimeout(onSuccess, 1500)
  }, [txId, onSuccess])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="relative bg-[var(--color-pine)] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {pixState !== 'success' && (
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors">
              <X size={20} />
            </button>
          )}

          {pixState === 'success' ? (
            <div className="py-6">
              <CheckCircle2 size={64} className="text-[var(--color-mint)] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                pagamento confirmado!
              </h2>
              <p className="text-white/50 text-sm">{listing.title}</p>
              <p className="text-[var(--color-celadon)] text-xl font-black mt-2">{formatPrice(listing.priceCents)}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  pagamento via PIX
                </h2>
                <span className="text-white/40 text-sm font-mono tabular-nums">{mins}:{secs}</span>
              </div>
              <p className="text-white/40 text-sm mb-1 truncate">{listing.title}</p>
              <p className="text-[var(--color-celadon)] text-2xl font-black mb-6">{formatPrice(listing.priceCents)}</p>

              <div className="flex justify-center mb-5">
                <div className="p-3 bg-[var(--color-celadon)] rounded-2xl">
                  <QrCanvas value={pixPayload} size={200} />
                </div>
              </div>

              <p className="text-white/40 text-sm mb-4 leading-relaxed">
                abra o app do seu banco → <strong className="text-white/60">Pix → Pagar com QR Code</strong>
              </p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mb-5">
                <p className="text-amber-300/80 text-xs">simulação — nenhum valor real será cobrado</p>
              </div>

              <button
                onClick={confirmPayment}
                disabled={pixState === 'confirming'}
                className="w-full py-4 rounded-2xl bg-[var(--color-teal)] hover:bg-[var(--color-emerald)] active:scale-95 transition-all font-semibold text-white text-base disabled:opacity-50"
              >
                {pixState === 'confirming' ? 'confirmando…' : '✓  já paguei'}
              </button>

              <button onClick={onClose} className="w-full mt-3 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-colors text-sm">
                cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Success fullscreen ─────────────────────────────────────────

function SuccessScreen({ listing, onBack }: { listing: TotemListing; onBack: () => void }) {
  const [countdown, setCountdown] = useState(8)
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { onBack(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [onBack])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-forest)]">
      <CheckCircle2 size={96} className="text-[var(--color-mint)] mb-6" />
      <h1 className="text-4xl font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>compra realizada!</h1>
      <p className="text-white/60 text-lg mb-1">{listing.title}</p>
      <p className="text-[var(--color-celadon)] text-2xl font-black mb-8">{formatPrice(listing.priceCents)}</p>
      <p className="text-white/30 text-sm">voltando ao feed em {countdown}s…</p>
    </div>
  )
}

// ── Listing card ───────────────────────────────────────────────

function TotemCard({ listing, onBuy }: { listing: TotemListing; onBuy: (l: TotemListing) => void }) {
  const unit = simulatedUnit(listing.unitNumber, listing.sellerName)
  const firstName = listing.sellerName.split(' ')[0]

  return (
    <div className="bg-[var(--color-pine)]/60 border border-white/8 rounded-2xl overflow-hidden flex flex-col group hover:border-[var(--color-teal)]/40 hover:bg-[var(--color-pine)]/80 transition-all duration-200">
      <div className="relative aspect-square overflow-hidden bg-[var(--color-forest)]">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-5xl font-black">{listing.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full border', conditionColor[listing.condition])}>
            {conditionLabel[listing.condition]}
          </span>
        </div>
        {listing.brandName && (
          <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
            {listing.brandName}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <p className="text-[var(--color-celadon)] text-xl font-black leading-none mb-1.5">
            {formatPrice(listing.priceCents)}
          </p>
          <p className="text-white/80 text-sm font-medium leading-snug line-clamp-2">{listing.title}</p>
          {listing.size && <p className="text-white/30 text-xs mt-1">tamanho {listing.size}</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          <div className="w-6 h-6 rounded-full bg-[var(--color-teal)]/20 border border-[var(--color-teal)]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black text-[var(--color-celadon)]">{firstName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white/60 text-xs truncate">{firstName.toLowerCase()}</p>
            <p className="text-white/30 text-[10px]">{unit}</p>
          </div>
        </div>

        <button
          onClick={() => onBuy(listing)}
          className="w-full py-3 rounded-xl bg-[var(--color-teal)] hover:bg-[var(--color-emerald)] active:scale-95 transition-all text-sm font-bold text-white"
        >
          comprar
        </button>
      </div>
    </div>
  )
}

// ── Main TotemFeed ─────────────────────────────────────────────

// ── Filters panel ─────────────────────────────────────────────

type FiltersState = {
  brands: string[]
  conditions: ListingCondition[]
}

function FiltersPanel({
  allBrands,
  current,
  onChange,
  onClose,
}: {
  allBrands: string[]
  current: FiltersState
  onChange: (f: FiltersState) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<FiltersState>(current)

  function toggleBrand(brand: string) {
    setDraft((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }))
  }

  function toggleCondition(condition: ListingCondition) {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }))
  }

  function clearAll() {
    setDraft({ brands: [], conditions: [] })
  }

  function apply() {
    onChange(draft)
    onClose()
  }

  const activeCount = draft.brands.length + draft.conditions.length

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="relative bg-[var(--color-pine)] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              filtros
            </h2>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Condition filter */}
          <div className="mb-6">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">estado do produto</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(conditionLabel) as ListingCondition[]).map((cond) => (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-bold border transition-all',
                    draft.conditions.includes(cond)
                      ? 'bg-[var(--color-teal)] border-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/30'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  )}
                >
                  {conditionLabel[cond]}
                </button>
              ))}
            </div>
          </div>

          {/* Brand filter */}
          {allBrands.length > 0 && (
            <div className="mb-7">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">marca</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {allBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-bold border transition-all',
                      draft.brands.includes(brand)
                        ? 'bg-[var(--color-teal)] border-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/30'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={clearAll}
              disabled={activeCount === 0}
              className="flex-1 py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              limpar
            </button>
            <button
              onClick={apply}
              className="flex-1 py-3 rounded-2xl bg-[var(--color-teal)] hover:bg-[var(--color-emerald)] active:scale-95 transition-all text-white text-sm font-bold"
            >
              aplicar {activeCount > 0 ? `(${activeCount})` : ''}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Modal type ─────────────────────────────────────────────────

type Modal =
  | { type: 'login'; afterLogin?: () => void }
  | { type: 'purchase'; listing: TotemListing }
  | { type: 'pix'; listing: TotemListing }
  | { type: 'success'; listing: TotemListing }
  | { type: 'filters' }
  | null

export function TotemFeed({ community, listings, categories }: Props) {
  const [totemUser, setTotemUser] = useState<TotemUser | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [search, setSearch] = useState('')
  const [showSort, setShowSort] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [activeFilters, setActiveFilters] = useState<FiltersState>({ brands: [], conditions: [] })

  const allBrands = Array.from(new Set(listings.map((l) => l.brandName).filter((b): b is string => Boolean(b))))

  const handleBuy = useCallback((listing: TotemListing) => {
    if (!totemUser) {
      setModal({ type: 'login', afterLogin: () => setModal({ type: 'purchase', listing }) })
    } else {
      setModal({ type: 'purchase', listing })
    }
  }, [totemUser])

  const handleLoginSuccess = useCallback((user: TotemUser) => {
    setTotemUser(user)
    const afterLogin = modal?.type === 'login' ? modal.afterLogin : undefined
    setModal(null)
    setTimeout(() => { if (afterLogin) afterLogin() }, 200)
  }, [modal])

  const activeFilterCount = activeFilters.brands.length + activeFilters.conditions.length

  const filtered = listings
    .filter((l) => !selectedCategory || l.categorySlug === selectedCategory)
    .filter((l) => {
      if (!search) return true
      const q = search.toLowerCase()
      return l.title.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q)
    })
    .filter((l) => activeFilters.brands.length === 0 || (l.brandName !== null && activeFilters.brands.includes(l.brandName)))
    .filter((l) => activeFilters.conditions.length === 0 || activeFilters.conditions.includes(l.condition))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceCents - b.priceCents
      if (sortBy === 'price_desc') return b.priceCents - a.priceCents
      return 0
    })

  const sortLabels: Record<SortKey, string> = {
    newest: 'mais recentes',
    price_asc: 'menor preço',
    price_desc: 'maior preço',
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 border-b border-white/8"
        style={{ background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-pine) 100%)' }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-5">
          {/* Community identity */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {community.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.logoUrl}
                alt={community.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--color-teal)]/40 shadow-lg shadow-black/30"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl border-2 border-[var(--color-teal)]/40 flex items-center justify-center text-2xl font-black shadow-lg shadow-black/30 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-emerald), var(--color-teal))' }}
              >
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] text-[var(--color-celadon)]/70 font-bold uppercase tracking-widest">condomínio</p>
                <span className="w-1 h-1 rounded-full bg-[var(--color-teal)]" />
                <p className="text-[10px] text-white/30">{community.memberCount} moradores</p>
              </div>
              <h1 className="text-xl font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {community.name}
              </h1>
              {community.description && (
                <p className="text-white/40 text-xs mt-0.5 line-clamp-1 max-w-xs">{community.description}</p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="buscar itens ou vendedores…"
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--color-teal)]/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Kloop branding */}
          <div className="hidden lg:block ml-auto flex-shrink-0 text-right">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-0.5">powered by</p>
            <p className="text-lg font-black text-[var(--color-celadon)]" style={{ fontFamily: 'var(--font-display)' }}>kloop</p>
          </div>

          {/* User / Login */}
          <div className="flex-shrink-0 ml-2">
            {totemUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-white/30">logado como</p>
                  <p className="text-sm font-semibold text-white">{totemUser.name.split(' ')[0]}</p>
                </div>
                <button
                  onClick={() => setTotemUser(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Sair"
                >
                  <LogOut size={16} className="text-white/50" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModal({ type: 'login' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-teal)]/20 border border-[var(--color-teal)]/30 hover:bg-[var(--color-teal)]/30 active:scale-95 transition-all text-[var(--color-celadon)] text-sm font-semibold"
              >
                <LogIn size={16} />
                entrar
              </button>
            )}
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="max-w-screen-2xl mx-auto px-6 pb-3 flex items-center gap-3">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                selectedCategory === null
                  ? 'bg-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/30'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              todos ({listings.length})
            </button>
            {categories.map((cat) => {
              const count = listings.filter((l) => l.categorySlug === cat.slug).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    'shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                    selectedCategory === cat.slug
                      ? 'bg-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/30'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  )}
                >
                  {cat.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Filtros button */}
          <button
            onClick={() => setModal({ type: 'filters' })}
            className={cn(
              'relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap flex-shrink-0',
              activeFilterCount > 0
                ? 'bg-[var(--color-teal)]/20 border-[var(--color-teal)]/40 text-[var(--color-celadon)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
            )}
          >
            <SlidersHorizontal size={12} />
            filtros
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-teal)] text-[10px] text-white font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-bold transition-all whitespace-nowrap"
            >
              <ArrowUpDown size={12} />
              {sortLabels[sortBy]}
              <ChevronDown size={12} className={cn('transition-transform', showSort && 'rotate-180')} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--color-pine)] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 min-w-[160px]">
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSort(false) }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-bold transition-colors',
                      sortBy === key
                        ? 'bg-[var(--color-teal)]/20 text-[var(--color-celadon)]'
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-white/25 text-xs flex-shrink-0 tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </header>

      {/* ── Grid ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <SlidersHorizontal size={48} className="text-white/10 mb-4" />
            <p className="text-white/30 text-lg font-medium">nenhum item encontrado</p>
            <p className="text-white/20 text-sm mt-1">tente outro filtro ou busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((listing) => (
              <TotemCard key={listing.id} listing={listing} onBuy={handleBuy} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-3 px-6">
        <p className="text-center text-white/15 text-[11px]">
          kloop · marketplace de desapegos do condomínio · /totem/{community.slug}
        </p>
      </footer>

      {/* ── Modals ── */}
      {modal?.type === 'login' && (
        <LoginOverlay
          communityId={community.id}
          onSuccess={handleLoginSuccess}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'purchase' && (
        <PurchaseOverlay
          listing={modal.listing}
          onPixHere={() => {
            const listing = modal.listing
            setModal({ type: 'pix', listing })
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'pix' && totemUser && (
        <PixOverlay
          listing={modal.listing}
          communityId={community.id}
          userId={totemUser.id}
          onSuccess={() => {
            const listing = modal.listing
            setModal({ type: 'success', listing })
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'success' && (
        <SuccessScreen
          listing={modal.listing}
          onBack={() => setModal(null)}
        />
      )}

      {modal?.type === 'filters' && (
        <FiltersPanel
          allBrands={allBrands}
          current={activeFilters}
          onChange={setActiveFilters}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
