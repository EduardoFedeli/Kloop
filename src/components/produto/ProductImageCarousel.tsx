'use client'

// Adicionei useEffect
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
// Import Share2 -> Share, usei Share que parece mais nativo iOS/Android
import { ChevronLeft, Share, Heart, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

type ImageData = {
  id: string
  url: string
  altText: string | null
}

type Props = {
  images: ImageData[]
  title: string
  listingId: string
  initialFavorited: boolean
  initialFavoritesCount: number
  categorySlug: string
}

interface FavoriteResponse {
  favorited: boolean
  count: number
}

export function ProductImageCarousel({
  images,
  title,
  listingId,
  initialFavorited,
  initialFavoritesCount,
  categorySlug,
}: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [favorited, setFavorited] = useState(initialFavorited)
  const [favCount, setFavCount] = useState(initialFavoritesCount)
  const [favPending, setFavPending] = useState(false)

  // NOVO: Estado para controlar se a página foi scrollada
  const [scrolled, setScrolled] = useState(false)

  const displayImages =
    images.length > 0
      ? images
      : [{ id: 'fallback', url: 'https://picsum.photos/seed/kloop/600/600', altText: title }]

  // Lógica de Favoritar via API (não mudou, só organizei)
  const handleFavorite = async () => {
    if (favPending) return
    const prevFavorited = favorited
    const prevCount = favCount
    const nextFavorited = !prevFavorited
    setFavorited(nextFavorited)
    setFavCount(nextFavorited ? prevCount + 1 : Math.max(0, prevCount - 1))
    setFavPending(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/favorite`, {
        method: nextFavorited ? 'POST' : 'DELETE',
      })
      if (res.status === 401) {
        setFavorited(prevFavorited)
        setFavCount(prevCount)
        router.push('/login')
        return
      }
      if (!res.ok) {
        setFavorited(prevFavorited)
        setFavCount(prevCount)
        toast.error('Erro ao favoritar.')
        return
      }
      const data = await res.json() as FavoriteResponse
      setFavorited(data.favorited)
      setFavCount(data.count)
    } catch {
      setFavorited(prevFavorited)
      setFavCount(prevCount)
      toast.error('Erro ao favoritar.')
    } finally {
      setFavPending(false)
    }
  }

  // Lógica de Compartilhar (blindada e pronta pro MVP)
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Confira: ${title}`,
          text: 'Olha o que eu achei no Kloop!',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.log('Compartilhamento abortado', error)
    }
  }

  // NOVO: Efeito para escutar o scroll da página (com cleanup)
  useEffect(() => {
    const handleScroll = () => {
      // Threshold de 200px scrolled past before solid bar appears
      if (window.scrollY > 200) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentImage = displayImages[current]

  return (
    <div className="relative w-full aspect-square bg-gray-100 dark:bg-[var(--color-emerald)]/10">
      <Image
        src={currentImage?.url ?? ''}
        alt={currentImage?.altText ?? title}
        fill
        sizes="(max-width: 768px) 100vw, 672px"
        className="object-cover"
        priority={current === 0}
      />

      {/* Sombreamento no topo exclusivo para a imagem (scrolls with image) */}
      {/* Mudei h-28 -> h-40 para um gradiente mais suave e elegante com o header fixo */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none transition-opacity duration-300" style={{ opacity: scrolled ? 0 : 1 }} />

      {/* BOTÕES FIXOS / STICKY HEADER: Acompanham o scroll da tela inteira */}
      {/* Parent is fixed, changes color/shadow based on scrolled. Pointer-events depend on scrolled state */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-[var(--color-pine)]/95 backdrop-blur-sm border-b border-gray-100 dark:border-forest shadow-md pointer-events-auto"
            : "bg-transparent pointer-events-none"
        )}
      >
        {/* Inner Wrapper - Relative so we can absolute-center the title */}
        <div className="mx-auto max-w-2xl flex items-center justify-between p-4 pt-5 pb-4 relative">
          {/* Back Button */}
          {/* Conditional styling based on scrolled state */}
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className={cn(
              "flex items-center justify-center rounded-full transition hover:scale-105 active:scale-95",
              scrolled
                ? "w-9 h-9 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto"
                : "w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-md text-gray-800 dark:text-white shadow-sm hover:bg-white dark:hover:bg-black pointer-events-auto"
            )}
          >
            <ChevronLeft size={22} className="ml-[-2px]" />
          </button>

          {/* Scrolled State Title (Hidden initially, visible when scrolled) */}
          {/* Absolute center, truncated for mobile */}
          <div
            className={cn(
              "absolute inset-x-20 text-center flex justify-center items-center h-10 transition-opacity duration-300",
              scrolled ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[180px] sm:max-w-xs">
              {title.toLowerCase()}
            </p>
          </div>

          {/* Right Side Actions */}
          {/* pointer-events dependent on scrolled state to allow touches through transparent parent */}
          <div className={cn("flex items-center gap-2", !scrolled && "pointer-events-auto")}>
            {/* Share Button */}
            <button
              onClick={() => void handleShare()}
              aria-label="Compartilhar"
              className={cn(
                "flex items-center justify-center rounded-full transition",
                scrolled
                  ? "w-9 h-9 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto"
                  : "w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur-md text-gray-800 dark:text-white shadow-sm hover:bg-white dark:hover:bg-black pointer-events-auto"
              )}
            >
              <Share size={18} />
            </button>

            {/* Favorite Button */}
            {/* Scrolled favorite is cleaner, just a button inside solid header. Not scrolled favorite has backdrop filter */}
            <button
              onClick={() => void handleFavorite()}
              aria-label={favorited ? 'Remover dos favoritos' : 'Favoritar'}
              disabled={favPending}
              className={cn(
                'flex items-center gap-1.5 px-3.5 transition-all',
                // Default style when NOT scrolled (like it was)
                !scrolled && 'h-10 rounded-full bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black backdrop-blur-md shadow-sm pointer-events-auto',
                // Scrolled state logic
                scrolled && favorited && 'h-9 rounded-full bg-[var(--color-teal)]/90 hover:bg-[var(--color-teal)] dark:bg-[var(--color-emerald)]/90 dark:hover:bg-[var(--color-emerald)] shadow-sm pointer-events-auto',
                scrolled && !favorited && 'h-9 rounded-full text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto',
                favPending && 'opacity-60 cursor-not-allowed',
              )}
            >
              <Heart
                size={18}
                className={cn(
                  'transition-colors flex-shrink-0',
                  // Red Heart when favorited, regardless of scrolled or not
                  favorited ? 'fill-[var(--color-teal)] text-[var(--color-teal)] dark:fill-[var(--color-emerald)] dark:text-[var(--color-emerald)]' : '',
                  // Override red heart color if NOT scrolled and NOT favorited
                  !favorited && scrolled && 'text-gray-800 dark:text-white',
                  !favorited && !scrolled && 'text-gray-800 dark:text-white'
                )}
              />
              {favCount > 0 && (
                <span className={cn('text-[12px] font-bold leading-none mt-[1px]', favorited ? 'text-[var(--color-teal)] dark:text-[var(--color-emerald)]' : 'text-gray-800 dark:text-white')}>
                  {favCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores bolinha foto - Absolute inside relative parent, scrolls with image */}
      {/* Change bottom-14 -> bottom-10 for cleaner look */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Foto ${i + 1}`}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all pointer-events-auto',
                i === current ? 'bg-white scale-125' : 'bg-white/50',
              )}
            />
          ))}
        </div>
      )}

      {/* Ver similares (Absolute inside relative parent, scrolls with image) */}
      <Link
        href={`/search?cat=${categorySlug}`}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-white/85 dark:bg-black/60 backdrop-blur-md text-gray-800 dark:text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-white dark:hover:bg-black transition-colors shadow-sm"
      >
        <LayoutGrid size={13} />
        ver similares
      </Link>
    </div>
  )
}