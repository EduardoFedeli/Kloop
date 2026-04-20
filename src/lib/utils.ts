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
