import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Store, MessageCircle, ArchiveX, ShoppingBag, ChevronRight,
  PackageOpen, HelpCircle, Info, Coins, Handshake, Star,
} from 'lucide-react'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { formatPrice } from '@/lib/utils'
import { CoverUploader } from '@/components/perfil/CoverUploader'
import { getCashbackBalance } from '@/lib/cashback'

export default async function VendasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const myId = session.user.id

  const [userData, listings, completedTxs, pendingCount, activeOrdersCount, cashbackBalanceCents, pendingOffersCount] = await Promise.all([
    db.user.findUnique({
      where: { id: myId },
      select: { 
        name: true, 
        image: true, 
        avatarUrl: true, 
        coverUrl: true, 
        reviewsReceived: { select: { rating: true } },
        subscription: {
          select: {
            plan: {
              select: {
                slug: true
              }
            }
          }
        }
      },
    }),
    db.listing.findMany({
      where: { sellerId: myId },
      select: { status: true },
    }),
    db.transaction.findMany({
      where: { sellerId: myId, status: 'COMPLETED' },
      select: { amountCents: true, commissionCents: true },
    }),
    db.transaction.count({
      where: { sellerId: myId, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    }),
    db.transaction.count({
      where: { buyerId: myId, status: { in: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] } },
    }),
    getCashbackBalance(myId),
    db.offer.count({
      where: { sellerId: myId, status: 'PENDING_SELLER', expiresAt: { gt: new Date() } },
    }),
  ])

  const active = listings.filter((l) => l.status === 'ACTIVE').length
  const sold = listings.filter((l) => l.status === 'SOLD').length
  const inactive = listings.filter((l) => ['DRAFT', 'PAUSED', 'EXPIRED'].includes(l.status)).length
  const revenue = completedTxs.reduce((sum, t) => sum + t.amountCents - t.commissionCents, 0)

  const totalRatings = userData?.reviewsReceived.length ?? 0
  const avgRating = totalRatings > 0
    ? (userData!.reviewsReceived.reduce((s, r) => s + r.rating, 0) / totalRatings).toFixed(1)
    : null

  const displayName = userData?.name ?? session.user.name ?? 'minha lojinha'
  const avatarSrc = userData?.avatarUrl ?? userData?.image ?? session.user.image ?? null
  const coverUrl = userData?.coverUrl ?? null
  const userInitials = displayName.substring(0, 2).toUpperCase()
  
  const userPlanSlug = (userData?.subscription?.plan?.slug as "basic" | "pro" | "premium" | "enterprise") || 'basic'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">

      <div className="md:max-w-2xl lg:max-w-5xl md:mx-auto">

        {/* ── Capa e Perfil ── */}
        <section className="relative bg-white dark:bg-[var(--color-pine)]">
          <div className="h-32 bg-gray-200 dark:bg-[var(--color-forest)] w-full overflow-hidden relative">
            <CoverUploader currentCoverUrl={coverUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          <div className="px-4 pb-4 -mt-10 relative z-10 flex justify-between items-end">
            <div className="flex flex-col">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[var(--color-pine)] bg-gray-100 dark:bg-[var(--color-forest)] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[18px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)]">{userInitials}</span>
                )}
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-black text-[var(--foreground)] tracking-tight leading-none">
                    {displayName}
                  </h1>
                  <PlanBadge plan={userPlanSlug} />
                </div>
                <Link href="/vendas/avaliacoes" className="flex items-center gap-1.5 mt-1 hover:opacity-80 transition-opacity">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < Math.round(Number(avgRating ?? 0))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300 dark:fill-white/20 dark:text-white/20'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[13px] text-gray-500 dark:text-sage">
                    {avgRating !== null
                      ? `${avgRating} · ${totalRatings} ${totalRatings === 1 ? 'avaliação' : 'avaliações'}`
                      : 'sem avaliações'}
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/create"
                className="hidden md:flex items-center gap-2 bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] px-5 py-2.5 rounded-full font-black text-[14px] shadow hover:opacity-90 transition-opacity"
              >
                criar anúncio
              </Link>
              <Link
                href={`/profile/${myId}`}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Layout duas colunas (lg+) ── */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:px-6 lg:mt-6 lg:items-start">

          {/* Coluna esquerda */}
          <div className="lg:col-span-3 space-y-6">

            {/* Meu Cashback */}
            <section className="px-4 mt-6 lg:mt-0 lg:px-0">
              <Link
                href="/cashback"
                className="group block rounded-2xl bg-[var(--color-celadon)]/15 dark:bg-[var(--color-celadon)]/10 border border-[var(--color-celadon)]/40 dark:border-[var(--color-celadon)]/20 p-5 relative overflow-hidden"
              >
                <div className="absolute right-[-20px] top-[-20px] w-28 h-28 bg-[var(--color-celadon)]/30 rounded-full blur-2xl group-hover:bg-[var(--color-celadon)]/50 transition-colors" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-teal)] dark:text-[var(--color-celadon)] mb-1">meu cashback</p>
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-[28px] font-black text-[var(--foreground)] leading-none">
                      {formatPrice(cashbackBalanceCents)}
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-sage mt-1">saldo disponível</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            </section>

            {/* KloopBank */}
            <section className="px-4 lg:px-0">
              <Link
                href="/financeiro"
                className="group block bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-5 text-white shadow-md relative overflow-hidden border border-transparent dark:border-white/5"
              >
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/20 rounded-full blur-2xl group-hover:bg-[var(--color-teal)]/40 transition-colors" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-1">meu kloopbank</p>
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-[28px] font-black leading-none">{formatPrice(revenue)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[13px] text-white/80">saldo disponível</p>
                      <div className="relative group/tip">
                        <Info size={14} className="text-white/50 cursor-pointer" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[var(--color-forest)] text-white text-[11px] leading-relaxed font-medium px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20">
                          soma do valor líquido de todas as vendas concluídas, após desconto da comissão do kloop.
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-forest)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            </section>

            {/* Botão criar — visível só em tablet */}
            <section className="px-4 md:px-0 lg:hidden">
              <Link
                href="/create"
                className="hidden md:flex items-center justify-center w-full bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] py-4 rounded-full font-black text-[15px] shadow hover:opacity-90 transition-opacity"
              >
                criar novo anúncio
              </Link>
            </section>

          </div>

          {/* Coluna direita */}
          <div className="lg:col-span-2 space-y-4">

            {/* Métricas 2x2 */}
            <section className="px-4 mt-6 lg:mt-0 lg:px-0">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/vendas/ativos" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 dark:bg-[var(--color-celadon)]/10 flex items-center justify-center text-[var(--color-pine)] dark:text-[var(--color-celadon)] group-hover:bg-[var(--color-teal)]/20 transition-colors">
                      <Store size={20} />
                    </div>
                    <span className="text-[20px] font-black text-[var(--foreground)]">{active}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">à venda</p>
                </Link>

                <Link href="/vendas/pendentes" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 transition-colors">
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[20px] font-black text-[var(--foreground)]">{pendingCount}</span>
                      {pendingCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-red-500 mb-3" />}
                    </div>
                  </div>
                  <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">pedidos pendentes</p>
                </Link>

                <Link href="/vendas/inativos" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-sage group-hover:bg-gray-200 transition-colors">
                      <ArchiveX size={20} />
                    </div>
                    <span className="text-[20px] font-black text-[var(--foreground)]">{inactive}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">anúncios inativos</p>
                </Link>

                <Link href="/vendas/historico" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 transition-colors">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-[20px] font-black text-[var(--foreground)]">{sold}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">produtos vendidos</p>
                </Link>
              </div>
            </section>

            {/* Ofertas pendentes */}
            <section className="px-4 lg:px-0">
              <Link
                href="/vendas/ofertas"
                className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                    <Handshake size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[var(--foreground)]">ofertas recebidas</p>
                    <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
                      {pendingOffersCount > 0
                        ? `${pendingOffersCount} ${pendingOffersCount === 1 ? 'oferta aguardando' : 'ofertas aguardando'} sua resposta`
                        : 'nenhuma oferta pendente'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingOffersCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center">
                      {pendingOffersCount}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            </section>

            {/* Minhas Compras */}
            <section className="px-4 lg:px-0">
              <Link
                href="/compras"
                className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[var(--foreground)]">minhas compras</p>
                    <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
                      {activeOrdersCount > 0
                        ? `${activeOrdersCount} ${activeOrdersCount === 1 ? 'pedido' : 'pedidos'} em andamento`
                        : 'ver histórico de compras'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeOrdersCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            </section>

            {/* Kloop Pro -> Redirecionamento Dinâmico */}
            <section className="px-4 lg:px-0">
              <Link href="/pro/dashboard" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                    <PackageOpen size={24} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-[var(--foreground)]">painel kloop pro</p>
                    <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">acompanhe seus lotes e vendas pro</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            </section>

            {/* Ajuda */}
            <section className="px-4 lg:px-0">
              <Link href="/ajuda" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-[var(--foreground)]">central de ajuda</p>
                    <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">dúvidas sobre vendas, envios ou taxas?</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            </section>

          </div>
        </div>
      </div>

      {/* FAB — só mobile */}
      <div className="md:hidden fixed bottom-[80px] left-1/2 -translate-x-1/2 z-30 w-full px-4 max-w-sm">
        <Link
          href="/create"
          className="w-full bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] px-6 py-4 rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-teal)]/30 dark:shadow-[var(--color-celadon)]/20 hover:scale-[1.02] transition-transform font-black text-[15px]"
        >
          criar novo anúncio
        </Link>
      </div>
    </div>
  )
}