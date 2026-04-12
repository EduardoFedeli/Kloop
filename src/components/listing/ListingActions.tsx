"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Edit2, Trash2, MessageCircle, ShoppingBag } from "lucide-react"
import { deleteListingAction } from "@/lib/actions/listing"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { ListingStatus } from "@prisma/client"

type Props = {
  listing: { id: string; slug: string; status: ListingStatus }
  isOwner: boolean
}

export function ListingActions({ listing, isOwner }: Props) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = async () => {
    const result = await deleteListingAction(listing.id)
    if (result.success) {
      toast.success("Anúncio excluído!")
      router.push("/dashboard")
    } else {
      toast.error(result.error)
    }
  }

  if (isOwner) {
    return (
      <>
        <div className="flex gap-3">
          {listing.status !== "SOLD" && (
            <Link
              href={`/listing/${listing.slug}/edit`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-airforce text-airforce font-bold text-sm hover:bg-airforce hover:text-white transition-colors"
            >
              <Edit2 size={16} />
              Editar
            </Link>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-red-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Excluir anúncio"
          description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      </>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        disabled
        title="Chat em breve"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
      >
        <MessageCircle size={16} />
        Conversar
      </button>
      <button
        disabled
        title="Compra em breve"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-airforce/20 text-airforce/50 font-bold text-sm cursor-not-allowed"
      >
        <ShoppingBag size={16} />
        Comprar agora
      </button>
    </div>
  )
}
