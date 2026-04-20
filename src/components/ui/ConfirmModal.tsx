"use client"

import { useTransition } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-airforce">{title}</h3>
          <button
            onClick={onClose}
            className="text-teal-muted hover:text-airforce transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-teal-muted/40 text-sm font-medium text-airforce hover:bg-linen transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors",
              isPending ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isPending ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
