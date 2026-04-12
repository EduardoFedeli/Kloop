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
}

export function FavoriteButton({ listingId, initialFavorited }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    const prev = favorited
    setFavorited(!prev)

    startTransition(async () => {
      const result = await toggleFavorite(listingId)
      if ('error' in result) {
        setFavorited(prev)
        if (result.error === 'unauthenticated') {
          router.push('/')
        } else {
          toast.error('Erro ao favoritar. Tente novamente.')
        }
        return
      }
      setFavorited(result.favorited)
    })
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
