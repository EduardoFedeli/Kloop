'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { toggleFavorite } from '@/app/actions/favorites'

type Props = {
  listingId: string
  initialFavorited: boolean
  showCount?: boolean
  count?: number
}

export function FavoriteButton({ listingId, initialFavorited, showCount = false, count = 0 }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [displayCount, setDisplayCount] = useState(count)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    const prev = favorited
    setFavorited(!prev)
    setDisplayCount(c => prev ? c - 1 : c + 1)

    startTransition(async () => {
      const result = await toggleFavorite(listingId)
      if ('error' in result) {
        setFavorited(prev)
        setDisplayCount(c => prev ? c + 1 : c - 1)
        if (result.error === 'unauthenticated') {
          router.push('/')
        } else {
          toast.error('Erro ao favoritar. Tente novamente.')
        }
        return
      }
      setFavorited(result.favorited)
      router.refresh()
    })
  }

  if (showCount) {
    return (
      <button
        type="button"
        aria-label={favorited ? 'Remover dos favoritos' : 'Favoritar'}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'absolute top-1.5 right-1.5 flex items-center gap-1 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full px-2 py-1 shadow-sm transition-opacity',
          isPending && 'opacity-60'
        )}
      >
        <Heart
          size={11}
          className={cn(
            'transition-colors duration-150',
            favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400 dark:text-white/50'
          )}
        />
        <span className="text-[11px] font-black text-[var(--color-pine)] dark:text-white">{Math.max(0, displayCount)}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={favorited ? 'Remover dos favoritos' : 'Favoritar'}
      onClick={handleClick}
      className={cn(
        'absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-150',
        isPending ? 'opacity-70' : 'hover:bg-white',
        favorited ? 'scale-110' : 'scale-100'
      )}
    >
      <Heart
        size={16}
        className={cn(
          'transition-colors duration-150',
          favorited ? 'fill-teal text-teal' : 'text-teal-muted'
        )}
      />
    </button>
  )
}
