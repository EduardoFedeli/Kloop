import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatZipCode(zip: string): string {
  const digits = zip.replace(/\D/g, "")
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : zip
}

// Discount tiers applied by the platform (seller cannot choose %)
// Days 0-14: none | 15-21: -15% | 22-29: -25% | 30-36: -32% | 37+: -40%
export function getListingDiscount(
  priceCents: number,
  createdAt: Date | string,
  acceptsDiscount: boolean
): { discountPercent: number; discountedPriceCents: number } | null {
  if (!acceptsDiscount) return null
  const daysSinceListed = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  let discountPercent = 0
  if (daysSinceListed >= 37) discountPercent = 40
  else if (daysSinceListed >= 30) discountPercent = 32
  else if (daysSinceListed >= 22) discountPercent = 25
  else if (daysSinceListed >= 15) discountPercent = 15
  else return null
  return {
    discountPercent,
    discountedPriceCents: Math.round(priceCents * (1 - discountPercent / 100)),
  }
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000))

  if (diff < 60) return "agora"
  if (diff < 3600) {
    const mins = Math.floor(diff / 60)
    return `há ${mins} min`
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `há ${hours} h`
  }
  if (diff < 604800) { // 7 days
    const days = Math.floor(diff / 86400)
    return `há ${days} ${days === 1 ? "dia" : "dias"}`
  }
  return formatDate(d)
}
