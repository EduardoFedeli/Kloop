'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { TransactionStatus } from '@prisma/client'

interface Props {
  transactionId: string
  status: TransactionStatus
}

export function BuyerOrderActions({ transactionId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const post = async (action: string) => {
    setLoading(action)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/${action}`, { method: 'POST' })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao processar ação.')
        return
      }
      router.refresh()
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'PENDING') {
    return (
      <button
        onClick={() => void post('cancel')}
        disabled={!!loading}
        className="w-full py-3.5 rounded-2xl border-2 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        {loading === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : 'cancelar pedido'}
      </button>
    )
  }

  if (status === 'SHIPPED') {
    return (
      <button
        onClick={() => void post('deliver')}
        disabled={!!loading}
        className="w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading === 'deliver' ? <Loader2 size={16} className="animate-spin" /> : 'marcar como recebido'}
      </button>
    )
  }

  if (status === 'DELIVERED') {
    return (
      <button
        onClick={() => void post('complete')}
        disabled={!!loading}
        className="w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading === 'complete' ? <Loader2 size={16} className="animate-spin" /> : 'confirmar recebimento e concluir'}
      </button>
    )
  }

  return null
}
