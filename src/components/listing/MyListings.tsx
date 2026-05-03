"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Edit2, Pause, Play, Trash2, Eye } from "lucide-react"
import { cn, formatPrice, formatDate } from "@/lib/utils"
import { deleteListingAction, toggleListingStatusAction } from "@/lib/actions/listing"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { ListingStatus } from "@prisma/client"

type ListingItem = {
  id: string
  title: string
  slug: string
  priceCents: number
  status: ListingStatus
  createdAt: Date
  viewsCount: number
  category: { name: string }
  images: { url: string }[]
}

type Props = {
  listings: ListingItem[]
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Ativo", className: "bg-celadon text-airforce" },
  PAUSED: { label: "Pausado", className: "bg-yellow-100 text-yellow-700" },
  SOLD: { label: "Vendido", className: "bg-gray-100 text-gray-500" },
  DRAFT: { label: "Rascunho", className: "bg-blue-100 text-blue-700" },
  EXPIRED: { label: "Expirado", className: "bg-red-100 text-red-600" },
}

export function MyListings({ listings }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = (listingId: string) => {
    startTransition(async () => {
      const result = await toggleListingStatusAction(listingId)
      if (result.success) {
        toast.success("Status atualizado!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteListingAction(deleteTarget)
    if (result.success) {
      toast.success("Anúncio excluído!")
    } else {
      toast.error(result.error)
    }
    setDeleteTarget(null)
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-teal-muted/20">
        <p className="text-teal-muted text-sm">Você ainda não tem anúncios.</p>
        <Link
          href="/create"
          className="inline-block mt-4 px-6 py-2.5 bg-airforce text-white text-sm font-bold rounded-full hover:bg-teal transition-colors"
        >
          Criar meu primeiro anúncio
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {listings.map((listing) => {
          const { label, className } = statusConfig[listing.status]
          const thumbUrl = listing.images[0]?.url

          return (
            <div
              key={listing.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-teal-muted/20 p-3 shadow-sm"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-linen">
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-muted text-[10px]">
                    sem foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/listing/${listing.slug}`}
                  className="block text-sm font-semibold text-airforce hover:text-teal line-clamp-1 transition-colors"
                >
                  {listing.title}
                </Link>
                <p className="text-sm font-bold text-airforce">{formatPrice(listing.priceCents)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", className)}>
                    {label}
                  </span>
                  <span className="text-[10px] text-teal-muted">{formatDate(listing.createdAt)}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-teal-muted">
                    <Eye size={10} />
                    {listing.viewsCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {listing.status !== "SOLD" && (
                  <Link
                    href={`/listing/${listing.slug}/edit`}
                    className="p-2 text-teal-muted hover:text-airforce transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </Link>
                )}
                {(listing.status === "ACTIVE" || listing.status === "PAUSED") && (
                  <button
                    onClick={() => handleToggleStatus(listing.id)}
                    disabled={isPending}
                    className="p-2 text-teal-muted hover:text-airforce disabled:opacity-50 transition-colors"
                    title={listing.status === "ACTIVE" ? "Pausar" : "Ativar"}
                  >
                    {listing.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(listing.id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Excluir anúncio"
        description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
