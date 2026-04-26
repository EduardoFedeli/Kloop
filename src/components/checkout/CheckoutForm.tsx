'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'
import { CreditCard, QrCode, FileText, ChevronRight, Loader2 } from 'lucide-react'

type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

interface Props {
  transactionId: string
  listing: {
    title: string
    priceCents: number
    imageUrl?: string
  }
  shippingCents: number
  amountCents: number
}

export function CheckoutForm({ transactionId, listing, shippingCents, amountCents }: Props) {
  const router = useRouter()
  const [method, setMethod] = useState<PaymentMethod>('PIX')
  const [loading, setLoading] = useState(false)

  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const handlePay = async () => {
    if (method === 'CREDIT_CARD') {
      if (!cardNumber.replace(/\s/g, '') || !cardExpiry || !cardCvv || !cardName.trim()) {
        toast.error('Preencha todos os dados do cartão.')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/transactions/${transactionId}/pay`, { method: 'POST' })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao processar pagamento.')
        return
      }
      router.push(`/checkout/sucesso/${transactionId}`)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-32">
      {/* Order summary */}
      <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 mb-6">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[var(--foreground)] leading-tight truncate">
              {listing.title}
            </p>
            <div className="mt-2 space-y-0.5">
              <div className="flex justify-between text-[13px] text-gray-500 dark:text-sage">
                <span>produto</span>
                <span>{formatPrice(listing.priceCents)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-gray-500 dark:text-sage">
                <span>frete</span>
                <span>{formatPrice(shippingCents)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-black text-[var(--foreground)] pt-1 border-t border-gray-100 dark:border-white/5 mt-1">
                <span>total</span>
                <span className="text-[var(--color-airforce)] dark:text-[var(--color-celadon)]">
                  {formatPrice(amountCents)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      <p className="text-[16px] font-black text-[var(--foreground)] mb-3">como você quer pagar?</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {(
          [
            { id: 'PIX', icon: QrCode, label: 'Pix' },
            { id: 'CREDIT_CARD', icon: CreditCard, label: 'Cartão' },
            { id: 'BOLETO', icon: FileText, label: 'Boleto' },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
              method === id
                ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[var(--color-pine)]',
            )}
          >
            <Icon
              size={20}
              className={method === id ? 'text-[var(--color-teal)]' : 'text-gray-400 dark:text-sage'}
            />
            <span
              className={cn(
                'text-[12px] font-bold',
                method === id ? 'text-[var(--color-teal)]' : 'text-gray-500 dark:text-sage',
              )}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Method content */}
      <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5 mb-6">
        {method === 'PIX' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-40 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
              <QrCode size={80} className="text-gray-400 dark:text-sage/40" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold text-[var(--foreground)]">
                escaneie com o app do seu banco
              </p>
              <p className="text-[12px] text-gray-400 dark:text-sage mt-1">
                chave:{' '}
                <span className="font-mono font-bold">kloop@pagamentos.com.br</span>
              </p>
            </div>
          </div>
        )}

        {method === 'CREDIT_CARD' && (
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-bold text-gray-500 dark:text-sage uppercase tracking-wide">
                número do cartão
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[var(--foreground)] text-[14px] font-mono focus:outline-none focus:border-[var(--color-teal)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-sage uppercase tracking-wide">
                  validade
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[var(--foreground)] text-[14px] font-mono focus:outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-gray-500 dark:text-sage uppercase tracking-wide">
                  CVV
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[var(--foreground)] text-[14px] font-mono focus:outline-none focus:border-[var(--color-teal)]"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-500 dark:text-sage uppercase tracking-wide">
                nome no cartão
              </label>
              <input
                type="text"
                placeholder="NOME SOBRENOME"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[var(--foreground)] text-[14px] font-mono focus:outline-none focus:border-[var(--color-teal)] uppercase"
              />
            </div>
          </div>
        )}

        {method === 'BOLETO' && (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-[11px] font-bold text-gray-400 dark:text-sage/60 uppercase tracking-wide mb-1">
                código do boleto (simulado)
              </p>
              <p className="font-mono text-[12px] text-[var(--foreground)] break-all leading-relaxed">
                34191.75579 20200.326629 38004.621808 4 93650000026990
              </p>
            </div>
            <p className="text-[12px] text-gray-400 dark:text-sage text-center">
              vencimento: próximo dia útil
            </p>
          </div>
        )}
      </div>

      {/* Confirm — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-t border-gray-100 dark:border-white/5">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => void handlePay()}
            disabled={loading}
            className={cn(
              'w-full py-4 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 transition-opacity',
              loading
                ? 'bg-gray-300 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--color-teal)] text-white hover:opacity-90',
            )}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {method === 'PIX' && 'já paguei (simular) ✓'}
                {method === 'CREDIT_CARD' && `pagar ${formatPrice(amountCents)}`}
                {method === 'BOLETO' && 'já paguei (simular) ✓'}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
