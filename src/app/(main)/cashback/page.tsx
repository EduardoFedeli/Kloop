import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Coins, Home } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCashbackBalance, getExpiringCashback } from '@/lib/cashback'
import { CashbackBalanceCard } from '@/components/cashback/CashbackBalanceCard'
import { formatPrice } from '@/lib/utils'
import { CashbackTransactionType } from '@prisma/client'

const EXPIRY_WARNING_DAYS = 15
const PAGE_SIZE = 20

const typeLabel: Record<CashbackTransactionType, string> = {
  CREDIT_SELLER: 'Cashback de venda',
  CREDIT_BUYER: 'Cashback de compra',
  DEBIT_PURCHASE: 'Usado em compra',
  REFUND_CANCELLATION: 'Estorno por cancelamento',
  REVERSAL: 'Estorno pós-conclusão',
  EXPIRATION: 'Expirado',
}

const isCredit = (type: CashbackTransactionType) =>
  type === CashbackTransactionType.CREDIT_SELLER ||
  type === CashbackTransactionType.CREDIT_BUYER ||
  type === CashbackTransactionType.REFUND_CANCELLATION

export default async function CashbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?redirectTo=/cashback')

  const userId = session.user.id

  const [balanceCents, expiringSoonCents, history] = await Promise.all([
    getCashbackBalance(userId),
    getExpiringCashback(userId, EXPIRY_WARNING_DAYS),
    db.cashbackTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      select: {
        id: true,
        type: true,
        amountCents: true,
        description: true,
        createdAt: true,
        expiresAt: true,
      },
    }),
  ])

  const hasBalance = balanceCents > 0

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/vendas" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">meu cashback</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Saldo */}
        {hasBalance ? (
          <CashbackBalanceCard
            balanceCents={balanceCents}
            expiringSoonCents={expiringSoonCents}
            expiryDays={EXPIRY_WARNING_DAYS}
          />
        ) : (
          <div className="rounded-2xl bg-[var(--color-celadon)]/10 border border-[var(--color-celadon)]/20 p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-celadon)]/20 flex items-center justify-center">
              <Coins size={28} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
            </div>
            <div>
              <p className="text-[28px] font-black text-[var(--foreground)] leading-none">R$ 0,00</p>
              <p className="text-[13px] text-gray-500 dark:text-sage mt-1">saldo disponível</p>
            </div>
            <p className="text-[13px] text-gray-500 dark:text-sage max-w-xs leading-relaxed">
              Você ainda não tem cashback acumulado. Compre ou venda pelo Kloop e ganhe de volta parte do valor!
            </p>
            <Link
              href="/"
              className="mt-2 flex items-center gap-2 bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] px-5 py-2.5 rounded-full font-black text-[14px] hover:opacity-90 transition-opacity"
            >
              <Home size={16} />
              explorar produtos
            </Link>
          </div>
        )}

        {/* Como funciona */}
        <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <p className="text-[15px] font-black text-[var(--foreground)] mb-3">como funciona</p>
          <div className="space-y-3">
            {[
              { emoji: '🛒', text: 'Compradores ganham 2% de cashback em cada compra concluída.' },
              { emoji: '🏷️', text: 'Vendedores ganham 5% de cashback em cada venda concluída.' },
              { emoji: '💸', text: 'Use até 30% do valor de uma compra com seu saldo.' },
              { emoji: '⏳', text: 'O cashback expira em 120 dias após ser creditado.' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-[18px] flex-shrink-0">{emoji}</span>
                <p className="text-[13px] text-gray-500 dark:text-sage leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico — só renderiza se tiver saldo ou movimentações */}
        {hasBalance && history.length > 0 && (
          <div>
            <p className="text-[17px] font-black text-[var(--foreground)] mb-3">movimentações</p>
            <div className="space-y-2">
              {history.map((entry) => {
                const credit = isCredit(entry.type)
                return (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--foreground)] truncate">
                        {typeLabel[entry.type]}
                      </p>
                      <p className="text-[12px] text-gray-400 dark:text-sage/60 mt-0.5">
                        {entry.createdAt.toLocaleDateString('pt-BR')}
                        {entry.expiresAt && credit && (
                          <span className="ml-2">
                            · expira {entry.expiresAt.toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={
                        credit
                          ? 'text-[14px] font-black text-emerald-600 dark:text-emerald-400 flex-shrink-0'
                          : 'text-[14px] font-black text-red-500 flex-shrink-0'
                      }
                    >
                      {credit ? '+' : '−'} {formatPrice(entry.amountCents)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
