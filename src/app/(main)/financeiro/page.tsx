import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowDownToLine, HelpCircle, TrendingUp, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

const HELP_ITEMS = [
  {
    q: 'o que é o kloopbank?',
    a: 'É sua carteira digital dentro do kloop. Toda venda concluída crédita o valor líquido (já descontada a comissão) no seu saldo disponível.',
  },
  {
    q: 'fiz um saque mas não caiu na conta?',
    a: 'Saques são processados em até 2 dias úteis. Se passou mais de 5 dias úteis sem o crédito, entre em contato com nosso suporte.',
  },
  {
    q: 'como funciona a comissão do kloop?',
    a: 'O kloop retém uma taxa de comissão sobre cada venda concluída. O valor que aparece no seu saldo já está com a comissão descontada.',
  },
  {
    q: 'quando posso sacar meu saldo?',
    a: 'O saque fica disponível assim que a venda é marcada como concluída pelo comprador. O valor mínimo para saque é R$ 10,00.',
  },
]

export default async function FinanceiroPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?redirectTo=/financeiro')

  const myId = session.user.id

  const [completedTxs, activeTxs] = await Promise.all([
    db.transaction.findMany({
      where: { sellerId: myId, status: 'COMPLETED' },
      select: {
        id: true,
        amountCents: true,
        commissionCents: true,
        completedAt: true,
        createdAt: true,
        listing: { select: { title: true, slug: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    db.transaction.findMany({
      where: { sellerId: myId, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
      select: { amountCents: true, commissionCents: true },
    }),
  ])

  const balanceCents = completedTxs.reduce((sum, t) => sum + t.amountCents - t.commissionCents, 0)
  const totalSoldCents = completedTxs.reduce((sum, t) => sum + t.amountCents, 0)
  const activeValueCents = activeTxs.reduce((sum, t) => sum + t.amountCents - t.commissionCents, 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/vendas" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">meu kloopbank</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-10 space-y-6">

        {/* Balance */}
        <div className="text-center space-y-1 pb-2">
          <p className="text-[12px] font-bold text-gray-400 dark:text-sage uppercase tracking-widest">
            saldo disponível hoje
          </p>
          <p className="text-[44px] font-black text-[var(--foreground)] tracking-tight leading-none">
            {formatPrice(balanceCents)}
          </p>
        </div>

        {/* Withdraw button */}
        <div className="space-y-2">
          <button
            disabled
            className="w-full py-4 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
          >
            <ArrowDownToLine size={18} />
            sacar meus dinheiros
          </button>
          <p className="text-center text-[12px] text-gray-400 dark:text-sage">
            função de saque em breve disponível
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 dark:text-orange-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-sage uppercase tracking-wide mb-0.5">
                vendas em andamento
              </p>
              <p className="text-[20px] font-black text-[var(--foreground)] leading-tight">
                {formatPrice(activeValueCents)}
              </p>
            </div>
            <Link
              href="/vendas/pendentes"
              className="text-[12px] text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-bold flex items-center gap-0.5"
            >
              ver detalhes <ChevronRight size={13} />
            </Link>
          </div>

          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 space-y-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-sage uppercase tracking-wide mb-0.5">
                total já vendido
              </p>
              <p className="text-[20px] font-black text-[var(--foreground)] leading-tight">
                {formatPrice(totalSoldCents)}
              </p>
            </div>
            <Link
              href="/vendas/historico"
              className="text-[12px] text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-bold flex items-center gap-0.5"
            >
              ver detalhes <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Movements */}
        <section>
          <h2 className="text-[15px] font-black text-[var(--foreground)] mb-3">últimas movimentações</h2>

          {completedTxs.length === 0 ? (
            <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-8 text-center">
              <p className="text-[14px] font-bold text-[var(--foreground)]">nenhuma movimentação ainda</p>
              <p className="text-[12px] text-gray-400 dark:text-sage mt-1">
                suas vendas concluídas aparecem aqui
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
              {completedTxs.slice(0, 20).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-teal)] dark:text-[var(--color-celadon)]">
                      venda concluída
                    </p>
                    <p className="text-[13px] text-[var(--foreground)] font-medium mt-0.5 truncate">
                      {tx.listing.title.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-sage mt-0.5">
                      {formatDate(tx.completedAt ?? tx.createdAt).split(' às')[0]}
                    </p>
                  </div>
                  <p className="text-[14px] font-black text-[var(--foreground)] flex-shrink-0">
                    +{formatPrice(tx.amountCents - tx.commissionCents)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Help */}
        <section>
          <h2 className="text-[15px] font-black text-[var(--foreground)] mb-3">dúvidas frequentes</h2>
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
            {HELP_ITEMS.map((item) => (
              <div key={item.q} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <HelpCircle
                    size={16}
                    className="text-[var(--color-teal)] dark:text-[var(--color-celadon)] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[14px] font-bold text-[var(--foreground)]">{item.q}</p>
                    <p className="text-[13px] text-gray-500 dark:text-sage mt-1 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
