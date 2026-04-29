'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Share2, Heart, LayoutGrid } from 'lucide-react'
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

  const displayImages =
    images.length > 0
      ? images
      : [{ id: 'fallback', url: 'https://picsum.photos/seed/kloop/600/600', altText: title }]

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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado!')
    }
  }

  const currentImage = displayImages[current]

  return (
    <div className="relative w-full aspect-square bg-gray-100 dark:bg-emerald/10">
      <Image
        src={currentImage?.url ?? ''}
        alt={currentImage?.altText ?? title}
        fill
        sizes="(max-width: 768px) 100vw, 672px"
        className="object-cover"
        priority={current === 0}
      />

      {/* Overlaid header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/35 to-transparent">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleShare()}
            aria-label="Compartilhar"
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <Share2 size={17} className="text-gray-800" />
          </button>
          <button
            onClick={() => void handleFavorite()}
            aria-label={favorited ? 'Remover dos favoritos' : 'Favoritar'}
            disabled={favPending}
            className={cn(
              'h-9 rounded-full backdrop-blur-sm flex items-center gap-1.5 px-3 transition-all',
              favorited ? 'bg-teal/90 hover:bg-teal' : 'bg-white/80 hover:bg-white',
              favPending && 'opacity-60 cursor-not-allowed',
            )}
          >
            <Heart
              size={17}
              className={cn(
                'transition-colors flex-shrink-0',
                favorited ? 'fill-white text-white' : 'text-gray-800',
              )}
            />
            {favCount > 0 && (
              <span className={cn('text-[11px] font-bold leading-none', favorited ? 'text-white' : 'text-gray-800')}>
                {favCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dots indicator */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Foto ${i + 1}`}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i === current ? 'bg-white scale-125' : 'bg-white/50',
              )}
            />
          ))}
        </div>
      )}

      {/* Ver similares */}
      <Link
        href={`/search?cat=${categorySlug}`}
        className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-2 rounded-full hover:bg-white transition-colors shadow-sm"
      >
        <LayoutGrid size={13} />
        ver similares
      </Link>
    </div>
  )
}
