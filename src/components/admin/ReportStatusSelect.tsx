"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateReportStatus } from "@/app/actions/admin"
import { cn } from "@/lib/utils"

interface Props {
  reportId: string
  currentStatus: string
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  INVESTIGATING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-[var(--color-teal)]/20 dark:text-[var(--color-celadon)]",
  DISMISSED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

export function ReportStatusSelect({ reportId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    startTransition(async () => {
      try {
        await updateReportStatus(reportId, newStatus)
        toast.success("Status atualizado com sucesso.")
      } catch (error) {
        toast.error("Erro ao atualizar a denúncia.")
      }
    })
  }

  return (
    <select
      disabled={isPending}
      value={currentStatus}
      onChange={handleChange}
      className={cn(
        "text-xs font-bold rounded-full px-3 py-1.5 outline-none cursor-pointer appearance-none border border-transparent",
        statusColors[currentStatus],
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      <option value="PENDING">Pendente</option>
      <option value="INVESTIGATING">Em Análise</option>
      <option value="RESOLVED">Resolvido</option>
      <option value="DISMISSED">Descartado</option>
    </select>
  )
}