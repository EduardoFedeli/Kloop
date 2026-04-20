// Carrossel de imagens do produto com botões sobrepostos de voltar, compartilhar e favoritar.
'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share2, Heart, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleFavorite } from '@/app/actions/favorites'
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
  categorySlug: string
}

export function ProductImageCarousel({
  images,
  title,
  listingId,
  initialFavorited,
  categorySlug,
}: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [favorited, setFavorited] = useState(initialFavorited)
  const [favPending, setFavPending] = useState(false)

  const displayImages =
    images.length > 0
      ? images
      : [{ id: 'fallback', url: 'https://picsum.photos/seed/kloop/600/600', altText: title }]

  const handleFavorite = async () => {
    if (favPending) return
    const prev = favorited
    setFavorited(!prev)
    setFavPending(true)
    const result = await toggleFavorite(listingId)
    setFavPending(false)
    if ('error' in result) {
      setFavorited(prev)
      if (result.error === 'unauthenticated') {
        router.push('/login')
      } else {
        toast.error('Erro ao favoritar.')
      }
    } else {
      setFavorited(result.favorited)
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

  return (
    <div className="relative w-full aspect-square bg-gray-100 dark:bg-emerald/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayImages[current]?.url}
        alt={displayImages[current]?.altText ?? title}
        className="w-full h-full object-cover"
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
              'w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all',
              favorited ? 'bg-teal/90 hover:bg-teal' : 'bg-white/80 hover:bg-white',
              favPending && 'opacity-60 cursor-not-allowed',
            )}
          >
            <Heart
              size={17}
              className={cn(
                'transition-colors',
                favorited ? 'fill-white text-white' : 'text-gray-800',
              )}
            />
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
