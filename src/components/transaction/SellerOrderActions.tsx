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

export function SellerOrderActions({ transactionId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [trackingCode, setTrackingCode] = useState('')
  const [showTracking, setShowTracking] = useState(false)

  const post = async (action: string, body?: Record<string, string>) => {
    setLoading(action)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/${action}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
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

  if (status === 'PAID') {
    return (
      <div className="space-y-3">
        {showTracking ? (
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-bold text-gray-500 dark:text-sage uppercase tracking-wide">
                código de rastreio (opcional)
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="BR123456789BR"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[var(--foreground)] text-[14px] font-mono focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>
            <button
              onClick={() => void post('ship', trackingCode ? { trackingCode } : undefined)}
              disabled={!!loading}
              className="w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'ship' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'confirmar envio'
              )}
            </button>
            <button
              onClick={() => setShowTracking(false)}
              className="w-full py-2 text-[13px] text-gray-400 dark:text-sage"
            >
              cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowTracking(true)}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            marcar como enviado
          </button>
        )}

        <button
          onClick={() => void post('cancel')}
          disabled={!!loading}
          className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 text-[13px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {loading === 'cancel' ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'cancelar pedido'}
        </button>
      </div>
    )
  }

  return null
}
