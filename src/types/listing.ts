import { ListingCondition } from '@prisma/client'

export type ListingWithDetails = {
  id: string
  title: string
  slug: string
  priceCents: number
  condition: ListingCondition
  brand: string | null
  category: {
    id: string
    name: string
    slug: string
  }
  images: {
    url: string
    altText: string | null
  }[]
  seller: {
    id: string
    name: string
    avatarUrl: string | null
    addresses: {
      city: string
      state: string
    }[]
  }
}

export type CategoryOption = {
  id: string
  name: string
  slug: string
}
