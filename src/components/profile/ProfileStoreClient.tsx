"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Megaphone, PlusCircle, Edit3, PauseCircle, Trash2, CalendarDays, Star, Package, Settings, Tag, SlidersHorizontal, ChevronDown, X, UserPlus, MessageSquare, MapPin, Search, Zap, Play } from "lucide-react"
import { toast } from "sonner"
import { ListingGrid } from "@/components/listing/ListingGrid"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { formatDate, formatPrice, cn } from "@/lib/utils"
import type { ListingWithDetails } from "@/types/listing"
import { PlanBadge } from "@/components/ui/PlanBadge"
import { toggleFollow } from "@/app/actions/interacoes"
import { deleteListingAction, toggleListingStatusAction } from "@/lib/actions/listing"
import { updateAvatarAction, updateCoverAction } from "@/lib/actions/profile"

type UserProfile = { id: string; name: string; bio: string | null; avatarUrl: string | null; coverUrl: string | null; createdAt: Date }
type ReviewData = { id: string; rating: number; comment: string | null; tags: string[]; createdAt: Date; reviewer: { name: string } }

type Props = {
  user: UserProfile
  isOwn: boolean
  listings: ListingWithDetails[]
  reviews: ReviewData[]
  avgRating: string | null
  totalRatings: number
  planName: string
  planVariant: "basic" | "pro" | "premium" | "enterprise"
  megaphonesAvailable: number
  itemsSold: number
  storeBrands: string[]
  storeConditions: string[]
  storeSizes: string[]
  storeCategories: string[]
  currentParams: Record<string, string | undefined>
  userLocation?: { city: string; state: string } | null
  initialIsFollowing?: boolean
  followersCount?: number
}

export function ProfileStoreClient({
  user, isOwn, listings, reviews, avgRating, totalRatings, planName, planVariant, megaphonesAvailable, itemsSold, followersCount = 0, initialIsFollowing = false, storeBrands, storeConditions, storeSizes, storeCategories, currentParams, userLocation
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false)
  const [isFollowPending, startFollowTransition] = useTransition()

  // ── ESTADOS DO BACKOFFICE ──
  const [backofficeSearch, setBackofficeSearch] = useState("")
  const [backofficeSort, setBackofficeSort] = useState<"recent" | "price_asc" | "price_desc">("recent")
  const [showOnlyTurbinados, setShowOnlyTurbinados] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isActionPending, startActionTransition] = useTransition()

  const router = useRouter()
  const searchParams = useSearchParams()
  const initials = user.name.substring(0, 2).toUpperCase()

  const handleFollowToggle = () => {
    setIsFollowing(prev => !prev)
    startFollowTransition(async () => {
      try {
        await toggleFollow(user.id, "USER")
      } catch {
        setIsFollowing(prev => !prev)
        toast.error("Erro ao atualizar follow")
      }
    })
  }

  const handleToggleStatus = (listingId: string) => {
    startActionTransition(async () => {
      const result = await toggleListingStatusAction(listingId)
      if (result.success) toast.success("Status atualizado!")
      else toast.error(result.error ?? "Erro ao atualizar status")
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteListingAction(deleteTarget)
    if (result.success) toast.success("Anúncio excluído!")
    else toast.error(result.error ?? "Erro ao excluir")
    setDeleteTarget(null)
  }

  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
    if (isUploading) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      if (!res.ok) { toast.error("Falha no upload"); return }
      const { url } = await res.json() as { url: string }
      const result = type === "avatar" ? await updateAvatarAction(url) : await updateCoverAction(url)
      if (result.success) toast.success(type === "avatar" ? "Foto de perfil atualizada!" : "Capa atualizada!")
      else toast.error(result.error ?? "Erro ao salvar")
    } catch {
      toast.error("Erro inesperado no upload")
    } finally {
      setIsUploading(false)
    }
  }

  const backofficeListing = listings
    .filter(l => !backofficeSearch || l.title.toLowerCase().includes(backofficeSearch.toLowerCase()))
    .filter(l => !showOnlyTurbinados || l.isTurbinado)
    .sort((a, b) => {
      if (backofficeSort === "price_asc") return a.priceCents - b.priceCents
      if (backofficeSort === "price_desc") return b.priceCents - a.priceCents
      return 0
    })

  // ── ESTADOS DO FILTRO ──
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localBrand, setLocalBrand] = useState(currentParams.brand || "")
  const [localMinPrice, setLocalMinPrice] = useState(currentParams.minPrice || "")
  const [localMaxPrice, setLocalMaxPrice] = useState(currentParams.maxPrice || "")
  const [localCondition, setLocalCondition] = useState(currentParams.condition || "")
  const [localSize, setLocalSize] = useState(currentParams.size || "")
  const [localCategory, setLocalCategory] = useState(currentParams.category || "")

  useEffect(() => {
    setLocalBrand(currentParams.brand || "")
    setLocalMinPrice(currentParams.minPrice || "")
    setLocalMaxPrice(currentParams.maxPrice || "")
    setLocalCondition(currentParams.condition || "")
    setLocalSize(currentParams.size || "")
    setLocalCategory(currentParams.category || "")
  }, [currentParams])

  const toggleBrand = (b: string) => setLocalBrand(prev => prev === b ? "" : b)
  const toggleCondition = (c: string) => setLocalCondition(prev => prev === c ? "" : c)
  const toggleSize = (s: string) => setLocalSize(prev => prev === s ? "" : s)
  const toggleCategory = (c: string) => setLocalCategory(prev => prev === c ? "" : c)

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (localBrand) params.set('brand', localBrand); else params.delete('brand')
    if (localMinPrice) params.set('minPrice', localMinPrice); else params.delete('minPrice')
    if (localMaxPrice) params.set('maxPrice', localMaxPrice); else params.delete('maxPrice')
    if (localCondition) params.set('condition', localCondition); else params.delete('condition')
    if (localSize) params.set('size', localSize); else params.delete('size')
    if (localCategory) params.set('category', localCategory); else params.delete('category')
    setIsFilterOpen(false)
    router.push(`/profile/${user.id}?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('brand'); params.delete('minPrice'); params.delete('maxPrice'); params.delete('condition'); params.delete('size'); params.delete('category');
    setLocalBrand(""); setLocalMinPrice(""); setLocalMaxPrice(""); setLocalCondition(""); setLocalSize(""); setLocalCategory("");
    setIsFilterOpen(false)
    router.push(`/profile/${user.id}?${params.toString()}`)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (newSort) params.set('sort', newSort); else params.delete('sort');
    router.push(`/profile/${user.id}?${params.toString()}`)
  }

  const conditionLabelMap: Record<string, string> = { NEW: 'novo', LIKE_NEW: 'seminovo', GOOD: 'bom estado', FAIR: 'usado' }
  const activeFilterTags = []
  if (currentParams.category) { const p = new URLSearchParams(searchParams.toString()); p.delete('category'); activeFilterTags.push({ label: `Dep: ${currentParams.category}`, removeUrl: `/profile/${user.id}?${p.toString()}` }) }
  if (currentParams.brand) { const p = new URLSearchParams(searchParams.toString()); p.delete('brand'); activeFilterTags.push({ label: `Marca: ${currentParams.brand}`, removeUrl: `/profile/${user.id}?${p.toString()}` }) }
  if (currentParams.size) { const p = new URLSearchParams(searchParams.toString()); p.delete('size'); activeFilterTags.push({ label: `Tamanho: ${currentParams.size}`, removeUrl: `/profile/${user.id}?${p.toString()}` }) }
  if (currentParams.minPrice) { const p = new URLSearchParams(searchParams.toString()); p.delete('minPrice'); activeFilterTags.push({ label: `A partir de R$ ${currentParams.minPrice}`, removeUrl: `/profile/${user.id}?${p.toString()}` }) }
  if (currentParams.maxPrice) { const p = new URLSearchParams(searchParams.toString()); p.delete('maxPrice'); activeFilterTags.push({ label: `Até R$ ${currentParams.maxPrice}`, removeUrl: `/profile/${user.id}?${p.toString()}` }) }
  if (currentParams.condition) { const p = new URLSearchParams(searchParams.toString()); p.delete('condition'); activeFilterTags.push({ label: conditionLabelMap[currentParams.condition] || 'condição', removeUrl: `/profile/${user.id}?${p.toString()}` }) }

  const defaultCover = "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)"
  const backgroundStyle = user.coverUrl ? `url(${user.coverUrl})` : defaultCover

  // ── LÓGICA DAS BARRAS DE AVALIAÇÃO ──
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++ })

  // ── MODAL DE AVALIAÇÕES (FULLSCREEN TIPO ENJOEI) ──
  if (isReviewsModalOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--color-forest)] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
        {/* Header Modal */}
        <div className="sticky top-0 z-40 bg-[var(--color-pine)] p-4 shadow-md flex items-center gap-3">
          <button onClick={() => setIsReviewsModalOpen(false)} className="text-white hover:opacity-70 p-1">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[18px] font-black text-white">avaliações da loja</h1>
        </div>

        <div className="p-4 space-y-6">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-white/40" />
              </div>
              <h2 className="text-[16px] font-bold text-white mb-2">nenhuma avaliação ainda</h2>
              <p className="text-[14px] text-white/50">as avaliações dos compradores aparecerão aqui</p>
            </div>
          ) : (
            <>
              {/* Card Resumo */}
              <div className="bg-[#1b3a2a] border border-[#234d38] rounded-2xl p-6 shadow-lg flex gap-6">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[48px] font-black text-white leading-none">{avgRating}</span>
                  <div className="flex mt-1">
                     {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Number(avgRating) ? "fill-[#f5d547] text-[#f5d547]" : "text-white/20"} />)}
                  </div>
                  <span className="text-[12px] font-medium text-white/60 mt-1">{totalRatings} avaliação{totalRatings !== 1 && 'ões'}</span>
                </div>
                
                <div className="flex-1 space-y-1.5 flex flex-col justify-center">
                  {[5,4,3,2,1].map((star) => {
                    const count = ratingCounts[star as keyof typeof ratingCounts]
                    const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-white/80 w-2">{star}</span>
                        <Star size={10} className="fill-[#f5d547] text-[#f5d547]" />
                        <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                          <div className="h-full bg-[#f5d547] rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-white/50 w-3 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lista de Avaliações */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-[#1b3a2a] border border-[#234d38] rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="text-[12px] font-medium text-[var(--color-sage)]">
                           <span className="font-bold text-white/80">{review.reviewer.name.toLowerCase()}</span> • {formatDate(review.createdAt)}
                         </p>
                       </div>
                       <div className="flex">
                         {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating ? "fill-[#f5d547] text-[#f5d547]" : "text-white/10"} />)}
                       </div>
                    </div>
                    
                    {review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                        {review.tags.map(tag => (
                          <span key={tag} className="bg-[var(--color-pine)]/50 border border-[var(--color-teal)]/30 text-[var(--color-celadon)] text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {review.comment && (
                      <p className="text-[14px] text-white mt-2 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── VISÃO DO DONO DA LOJA (BACKOFFICE) ──
  if (isOwn && isEditing) {
    return (
      <div className="min-h-screen bg-[var(--color-forest)] text-white flex flex-col">
        <div className="sticky top-0 z-30 bg-[var(--color-forest)]/95 backdrop-blur-md pt-4 pb-4 px-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setIsEditing(false)} className="p-1 hover:opacity-70 transition-opacity"><ArrowLeft size={24} className="text-white" /></button>
            <span className="font-bold text-[15px]">voltar para a vitrine</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">minha loja</h1>
              <p className="text-[13px] font-medium text-[var(--color-sage)] mt-1">{listings.length} anúncios • plano {planName}</p>
            </div>
            <Link href="/create" className="bg-[var(--color-teal)] text-white text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-[var(--color-teal)]/80 transition-colors">
              <PlusCircle size={16} /> novo anúncio
            </Link>
          </div>
        </div>

        <div className="px-4 pb-24 flex-1">
          <Link href="/vendas/megafone" className="bg-[#1b1b11] border border-[#3b3b22] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm mt-4 hover:border-[#f5d547]/40 transition-colors block">
            <div className="flex items-center gap-3">
              <Megaphone size={24} className="text-[#f5d547]" />
              <div>
                <h3 className="text-[15px] font-black text-[#f5d547] leading-tight">megafone</h3>
                <p className="text-[11px] font-medium text-[var(--color-sage)]">{megaphonesAvailable} disponíveis esta semana</p>
              </div>
            </div>
            <span className="text-3xl font-black text-[#f5d547]">{megaphonesAvailable}</span>
          </Link>

          {/* ── Ferramentas do Backoffice ── */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="buscar anúncio..."
                value={backofficeSearch}
                onChange={e => setBackofficeSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-white/30 outline-none focus:border-[var(--color-celadon)]/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyTurbinados(prev => !prev)}
                className={cn("flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border transition-colors", showOnlyTurbinados ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-white/5 border-white/10 text-white/70")}
              >
                <Zap size={12} fill={showOnlyTurbinados ? "currentColor" : "none"} /> só turbinados
              </button>

              <select
                value={backofficeSort}
                onChange={e => setBackofficeSort(e.target.value as typeof backofficeSort)}
                className="ml-auto bg-white/5 border border-white/10 text-white/70 text-[12px] font-bold rounded-full px-3 py-1.5 outline-none"
              >
                <option value="recent">mais recentes</option>
                <option value="price_desc">maior preço</option>
                <option value="price_asc">menor preço</option>
              </select>
            </div>
          </div>

          {backofficeListing.length > 0 ? (
            <div className="space-y-3">
              {backofficeListing.map(listing => {
                const isActive = listing.status === "ACTIVE"
                const isPaused = listing.status === "PAUSED"
                return (
                  <div key={listing.id} className="bg-white rounded-2xl p-3 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {listing.images[0] ? <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[var(--color-pine)] truncate">{listing.title}</h4>
                      <p className="text-[14px] font-black text-[var(--color-teal)] mt-0.5">{formatPrice(listing.priceCents)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isActive ? "bg-[var(--color-celadon)]/30 text-[var(--color-teal)]" : isPaused ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500")}>
                          {isActive ? "Ativo" : isPaused ? "Pausado" : listing.status}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--color-sage)] flex items-center gap-0.5">👁 {listing.viewsCount ?? 0}</span>
                        {listing.isTurbinado && <span className="text-[10px] font-bold text-[var(--color-teal)] flex items-center gap-0.5"><Zap size={9} fill="currentColor" /> turbinado</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 pr-1">
                      <Link href={`/listing/${listing.slug}/edit`} className="text-[var(--color-teal)] hover:opacity-70"><Edit3 size={17} /></Link>
                      {(isActive || isPaused) && (
                        <button onClick={() => handleToggleStatus(listing.id)} disabled={isActionPending} className="text-[var(--color-teal)] hover:opacity-70 disabled:opacity-40">
                          {isActive ? <PauseCircle size={17} /> : <Play size={17} />}
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(listing.id)} className="text-red-500 hover:opacity-70"><Trash2 size={17} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center mt-4">
              {listings.length === 0 ? (
                <>
                  <p className="text-[14px] text-[var(--color-teal)] font-medium mb-4">Você ainda não tem anúncios.</p>
                  <Link href="/create" className="inline-block bg-[var(--color-teal)] text-white font-bold text-[14px] px-6 py-3 rounded-full hover:opacity-90">Criar meu primeiro anúncio</Link>
                </>
              ) : (
                <p className="text-[14px] text-[var(--color-teal)] font-medium">Nenhum anúncio encontrado com esse filtro.</p>
              )}
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={deleteTarget !== null}
          title="Excluir anúncio"
          description="Tem certeza? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    )
  }
  
  // ── VISÃO PÚBLICA (VITRINE) ──
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="relative z-30 bg-[#163322] dark:bg-[var(--color-pine)] rounded-b-[32px] shadow-sm mb-6 pb-6">
        
        <div className="relative h-[110px] w-full rounded-t-none bg-cover bg-center" style={{ backgroundImage: backgroundStyle }}>
          <div className="absolute inset-0 bg-black/20 z-0"></div>

          {isOwn && (
            <label className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "cover") }} />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-2 backdrop-blur-sm">
                <Edit3 size={16} className="text-white" />
              </div>
            </label>
          )}

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <button onClick={() => router.back()} className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10 shadow-sm">
              <ArrowLeft size={20} />
            </button>

            {isOwn && (
              <button onClick={() => setIsEditing(true)} className="bg-black/30 hover:bg-black/50 text-white text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors backdrop-blur-md border border-white/10 shadow-sm">
                <Settings size={14} /> gerenciar loja
              </button>
            )}
          </div>
        </div>

        <div className="px-5 relative">
          <div className="absolute -top-10 w-[80px] h-[80px] rounded-full overflow-hidden bg-white border-4 border-[#163322] dark:border-[var(--color-pine)] shadow-md">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[var(--color-pine)]">{initials}</div>}
            {isOwn && (
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer group bg-transparent hover:bg-black/40 transition-colors rounded-full">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "avatar") }} />
                <Edit3 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </label>
            )}
          </div>

          {!isOwn && (
             <div className="absolute top-3 right-5">
               <button onClick={handleFollowToggle} disabled={isFollowPending} className={cn("text-[12px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border disabled:opacity-60", isFollowing ? "bg-transparent text-white border-white/40 hover:bg-white/10" : "bg-white text-[var(--color-pine)] border-white shadow-sm")}>
                 {!isFollowing && <UserPlus size={14} />} {isFollowing ? "seguindo" : "seguir"}
               </button>
             </div>
          )}

          <div className="h-12 w-full"></div>

          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-[22px] font-black text-white leading-tight">{user.name}</h1>
            {planVariant !== 'basic' && <PlanBadge plan={planVariant} />}
          </div>

          <button onClick={() => setIsReviewsModalOpen(true)} className="inline-flex items-center gap-1.5 mt-1.5 hover:opacity-80 transition-opacity group">
            <div className="flex">
              {[1,2,3,4,5].map(star => <Star key={star} size={12} className={cn("fill-current", avgRating && star <= Number(avgRating) ? "text-[#f5d547]" : "text-white/20")} />)}
            </div>
            <span className="text-[12px] font-medium text-[var(--color-sage)] group-hover:text-white transition-colors">{avgRating ? `${avgRating} (${totalRatings})` : 'sem avaliações'}</span>
          </button>

          {user.bio && <p className="text-[13px] text-white/80 mt-3 line-clamp-2">{user.bio}</p>}

          <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-bold text-white">
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-full border border-white/5"><Package size={12} className="opacity-80" /> {listings.length} anúncios</span>
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-full border border-white/5"><Tag size={12} className="opacity-80" /> {itemsSold} vendidos</span>
            <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-full border border-white/5 opacity-80"><CalendarDays size={12} className="opacity-80" /> kloop desde {new Date(user.createdAt).getFullYear()}</span>
            {userLocation && (
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1.5 rounded-full border border-white/5 opacity-80"><MapPin size={12} className="opacity-80" /> {userLocation.city}, {userLocation.state}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-black text-[var(--foreground)]">Anúncios ativos</h2>
          <div className="relative flex items-center gap-1">
            <span className="text-[12px] font-bold text-gray-500 dark:text-sage">ordenar por:</span>
            <div className="relative flex items-center">
              <select value={currentParams.sort || 'popular'} onChange={handleSortChange} className="appearance-none bg-transparent text-[12px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)] pr-4 cursor-pointer outline-none">
                <option value="popular">mais relevantes</option>
                <option value="recent">mais recentes</option>
                <option value="price_asc">menor preço</option>
                <option value="price_desc">maior preço</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 text-[var(--color-teal)] dark:text-[var(--color-celadon)] pointer-events-none" />
            </div>
          </div>
        </div>

        {activeFilterTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {activeFilterTags.map((af) => <Link key={af.label} href={af.removeUrl} className="flex-shrink-0 px-3 py-1.5 bg-[var(--color-teal)]/10 text-[var(--color-teal)] dark:bg-[var(--color-celadon)]/10 dark:text-[var(--color-celadon)] border border-[var(--color-teal)]/20 rounded-full text-[12px] font-bold flex items-center gap-1.5 hover:brightness-95 transition-all">{af.label} <X size={12} strokeWidth={3} /></Link>)}
          </div>
        )}
      </div>

      <div className="px-4">
        {listings.length > 0 ? (
          <ListingGrid listings={listings} variant="search" hideFavorite={isOwn} />
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-sage">
            <p className="text-[15px] font-medium">Esta loja ainda não tem anúncios.</p>
          </div>
        )}
      </div>

      <button onClick={() => setIsFilterOpen(true)} className="fixed bottom-24 right-4 z-40 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] pl-5 pr-6 py-4 rounded-full flex items-center gap-3 shadow-xl shadow-black/20 hover:scale-105 transition-transform">
        <SlidersHorizontal size={18} strokeWidth={2.5} />
        <span className="text-[15px] font-black tracking-tight">filtros</span>
        {activeFilterTags.length > 0 && <span className="w-5 h-5 bg-white dark:bg-[var(--color-pine)] text-[var(--color-pine)] dark:text-white rounded-full flex items-center justify-center text-[10px] font-black">{activeFilterTags.length}</span>}
      </button>

      {/* ── MODAL DE FILTROS ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[var(--color-pine)] w-full h-[90%] sm:max-w-lg sm:h-auto sm:rounded-3xl rounded-t-[32px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button onClick={() => setIsFilterOpen(false)} className="text-[var(--foreground)]"><X size={24} /></button>
              <h2 className="text-[18px] font-black text-[var(--foreground)]">filtros da loja</h2>
              <button onClick={clearAllFilters} className="text-[13px] font-bold text-red-500">limpar</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {storeCategories.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">departamentos</p>
                  <div className="flex flex-wrap gap-2">
                    {storeCategories.map(cat => <button key={cat} onClick={() => toggleCategory(cat)} className={cn("px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all", localCategory === cat ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]")}>{cat.toLowerCase()}</button>)}
                  </div>
                </section>
              )}
              {storeSizes.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {storeSizes.map(size => <button key={size} onClick={() => toggleSize(size)} className={cn("px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all", localSize === size ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]")}>{size.toUpperCase()}</button>)}
                  </div>
                </section>
              )}
              {storeConditions.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">condição</p>
                  <div className="flex flex-wrap gap-2">
                    {storeConditions.map(cond => <button key={cond} onClick={() => toggleCondition(cond)} className={cn("px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all", localCondition === cond ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]")}>{conditionLabelMap[cond] || cond}</button>)}
                  </div>
                </section>
              )}
              {storeBrands.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">marcas desta loja</p>
                  <div className="flex flex-wrap gap-2">
                    {storeBrands.map(b => <button key={b} onClick={() => toggleBrand(b)} className={cn("px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all", localBrand === b ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]")}>{b}</button>)}
                  </div>
                </section>
              )}
              <section>
                <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">faixa de preço</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent focus-within:border-[var(--color-teal)] transition-colors">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">de</p>
                    <input type="number" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)} placeholder="R$ 0" className="bg-transparent outline-none font-black w-full text-[var(--foreground)]" />
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent focus-within:border-[var(--color-teal)] transition-colors">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">até</p>
                    <input type="number" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)} placeholder="R$ 1000" className="bg-transparent outline-none font-black w-full text-[var(--foreground)]" />
                  </div>
                </div>
              </section>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-white/5">
              <button onClick={applyFilters} className="w-full bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] py-4 rounded-full font-black text-[16px] shadow-lg hover:opacity-90 transition-opacity">ver resultados</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}