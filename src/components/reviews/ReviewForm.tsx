"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

const REVIEW_TAGS = [
  'Envio rápido',
  'ótima embalagem',
  'ótima comunicação',
  'ótimo negociante',
  'ótimas fotos',
  'capricho',
  'produto bem descrito',
]

interface ReviewFormProps {
  transactionId: string
  sellerName: string
  listingTitle: string
}

export function ReviewForm({ transactionId, sellerName, listingTitle }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Selecione pelo menos uma estrela')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          rating,
          tags: selectedTags,
          comment: comment || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao enviar avaliação')
      }
      setSuccess(true)
      setTimeout(() => router.push('/compras'), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar avaliação')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="flex justify-center gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={28} className="fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-[16px] font-bold text-[var(--foreground)]">avaliação enviada!</p>
        <p className="text-[13px] text-gray-500 dark:text-sage">obrigado por avaliar o vendedor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[14px] text-gray-500 dark:text-sage mb-0.5">como foi sua experiência com</p>
        <p className="text-[18px] font-black text-[var(--foreground)]">{sellerName.toLowerCase()}</p>
        <p className="text-[13px] text-gray-400 dark:text-sage mt-0.5 truncate">{listingTitle}</p>
      </div>

      {/* Star picker */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-1.5 rounded-full hover:scale-110 transition-transform"
            >
              <Star
                size={38}
                className={
                  star <= (hovered || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'
                }
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-[13px] font-bold text-gray-500 dark:text-sage pl-1">
            {rating === 1 && 'muito ruim'}
            {rating === 2 && 'ruim'}
            {rating === 3 && 'ok'}
            {rating === 4 && 'bom'}
            {rating === 5 && 'excelente!'}
          </p>
        )}
      </div>

      {/* Tags */}
      {rating > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] font-bold text-gray-500 dark:text-sage">
            o que se destacou? <span className="font-normal">(opcional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-bold border transition-all ${
                    active
                      ? 'bg-[var(--color-teal)] border-[var(--color-teal)] text-white'
                      : 'bg-transparent border-gray-200 dark:border-white/20 text-gray-500 dark:text-sage hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Comment */}
      <div>
        <label className="text-[13px] font-bold text-gray-500 dark:text-sage mb-1.5 block">
          comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Descreva sua experiência com o vendedor..."
          className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[var(--color-teal)] transition-colors resize-none"
        />
        <p className="text-[11px] text-gray-400 text-right mt-0.5">{comment.length}/500</p>
      </div>

      {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full py-4 bg-[var(--color-teal)] text-white text-[15px] font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'enviando...' : 'enviar avaliação'}
      </button>
    </div>
  )
}
