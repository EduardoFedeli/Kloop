"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { reportItem } from "@/app/actions/interacoes"

interface ReportButtonProps {
  targetId: string
  targetType: "LISTING" | "USER"
}

export function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("FRAUD")
  const [isPending, startTransition] = useTransition()

  const handleReport = () => {
    startTransition(async () => {
      try {
        await reportItem(targetId, targetType, reason)
        toast.success("Denúncia enviada com sucesso. Nossa equipe vai analisar.")
        setIsOpen(false)
      } catch (error) {
        toast.error("Erro ao enviar denúncia. Tente novamente.")
      }
    })
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[13px] font-bold text-[var(--color-pine)] dark:text-white mt-2 hover:underline"
      >
        denunciar anúncio
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[var(--color-pine)] w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-[var(--foreground)]">Qual o problema?</h3>
            <p className="text-sm text-gray-600 dark:text-sage">Sua denúncia é anônima e ajuda a manter a comunidade segura.</p>
            
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[var(--color-forest)] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="FRAUD">Suspeita de fraude ou golpe</option>
              <option value="COUNTERFEIT">Produto falsificado</option>
              <option value="OFFENSIVE">Conteúdo ofensivo ou inadequado</option>
              <option value="OTHER">Outro motivo</option>
            </select>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 font-bold text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 py-3 rounded-xl transition"
              >
                cancelar
              </button>
              <button 
                onClick={handleReport}
                disabled={isPending}
                className="flex-1 font-bold text-sm bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl transition disabled:opacity-50"
              >
                {isPending ? 'enviando...' : 'enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}