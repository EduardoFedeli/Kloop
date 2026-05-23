import { ListingCondition, ListingStatus } from '@prisma/client'

export type ListingWithDetails = {
  id: string
  title: string
  slug: string
  priceCents: number
  condition: ListingCondition
  status: ListingStatus
  // 👇 AQUI ESTÁ A MUDANÇA: O brand agora é um objeto
  brand: {
    id: string
    name: string
    slug: string
  } | null
  size?: string | null
  isTurbinado?: boolean
  viewsCount?: number
  _count?: { favorites: number; listingCommunities?: number }
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