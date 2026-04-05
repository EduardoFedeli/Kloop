'use client'

import { useState } from 'react'
import type { ListingWithDetails, CategoryOption } from '@/types/listing'
import { CategoryFilter } from './CategoryFilter'
import { ListingGrid } from './ListingGrid'

type Props = {
  listings: ListingWithDetails[]
  categories: CategoryOption[]
}

export function HomeFeed({ listings, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered =
    selectedCategory === null
      ? listings
      : listings.filter((l) => l.category.slug === selectedCategory)

  return (
    <div className="space-y-4">
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <ListingGrid listings={filtered} />
    </div>
  )
}
