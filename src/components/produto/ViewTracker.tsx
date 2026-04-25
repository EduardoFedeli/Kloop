"use client"

import { useEffect } from "react"

interface Props {
  listingId: string
}

export function ViewTracker({ listingId }: Props) {
  useEffect(() => {
    fetch(`/api/listings/${listingId}/view`, { method: "POST" }).catch(() => {})
  }, [listingId])

  return null
}
