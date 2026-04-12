"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ImageData = {
  id: string
  url: string
  altText: string | null
}

type Props = {
  images: ImageData[]
  title: string
}

export function PhotoCarousel({ images, title }: Props) {
  const [current, setCurrent] = useState(0)

  const fallback = "https://picsum.photos/seed/thex-fallback/600/600"
  const displayImages =
    images.length > 0 ? images : [{ id: "fallback", url: fallback, altText: title }]

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-linen">
        <Image
          src={displayImages[current]?.url ?? fallback}
          alt={displayImages[current]?.altText ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Foto ${i + 1}`}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                i === current
                  ? "border-airforce"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.altText ?? title} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
