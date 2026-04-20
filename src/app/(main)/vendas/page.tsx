import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MessageCircle, ArchiveX, ShoppingBag, ChevronRight, Megaphone, Tags, BarChart2, Settings, PackageOpen, HelpCircle, Image as ImageIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function VendasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const myId = session.user.id
  const user = session.user

  const [listings, completedTxs] = await Promise.all([
    db.listing.findMany({
      where: { sellerId: myId },
      select: {
        status: true,
      },
    }),
    db.transaction.findMany({
      where: { sellerId: myId, status: 'COMPLETED' },
      select: { amountCents: true, commissionCents: true },
    }),
  ])

  // Cálculos das métricas
  const active = listings.filter((l) => l.status === 'ACTIVE').length
  const sold = listings.filter((l) => l.status === 'SOLD').length
  const inactive = listings.filter((l) => ['DRAFT', 'PAUSED', 'EXPIRED'].includes(l.status)).length
  const revenue = completedTxs.reduce((sum, t) => sum + t.amountCents - t.commissionCents, 0)
  
  // Pegar a inicial do nome do usuário para o fallback do avatar
  const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : 'US'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* ── Capa e Perfil ── */}
      <section className="relative bg-white dark:bg-[var(--color-pine)]">
        {/* Banner de Capa */}
        <div className="h-32 bg-gray-200 dark:bg-[var(--color-forest)] w-full overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-sage/50">
            <ImageIcon size={24} className="mb-1 opacity-50" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">adicionar capa</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Avatar e Info */}
        <div className="px-4 pb-4 -mt-10 relative z-10 flex justify-between items-end">
          <div className="flex flex-col">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[var(--color-pine)] bg-gray-100 dark:bg-[var(--color-forest)] flex items-center justify-center overflow-hidden shadow-sm">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || 'Usuário'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[18px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)]">{userInitials}</span>
              )}
            </div>
            <div className="mt-2">
              <h1 className="text-[20px] font-black text-[var(--foreground)] tracking-tight leading-none">
                {user.name || 'minha lojinha'}
              </h1>
              <p className="text-[13px] text-gray-500 dark:text-sage mt-1">⭐⭐⭐⭐⭐ • sem avaliações</p>
            </div>
          </div>
          
          {/* Botão que leva para a visão pública da loja */}
          <Link href={`/loja/${myId}`} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[var(--foreground)] mb-1 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shadow-sm">
            <ChevronRight size={22} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── Meu KloopBank (Resumo Financeiro) ── */}
      <section className="px-4 mt-6">
        <Link href="/financeiro" className="block bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group border border-transparent dark:border-white/5">
          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/20 rounded-full blur-2xl group-hover:bg-[var(--color-teal)]/40 transition-colors"></div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-1">meu kloopbank</p>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-[28px] font-black leading-none">{formatPrice(revenue)}</p>
              <p className="text-[13px] text-white/80 mt-1">saldo disponível</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <ChevronRight size={18} />
            </div>
          </div>
        </Link>
      </section>

      {/* ── Status da Lojinha ── */}
      <section className="px-4 mt-6 grid grid-cols-2 gap-3">
        <Link href="/vendas/ativos" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 dark:bg-[var(--color-celadon)]/10 flex items-center justify-center text-[var(--color-pine)] dark:text-[var(--color-celadon)] group-hover:bg-[var(--color-teal)]/20 transition-colors">
              <Store size={20} />
            </div>
            <span className="text-[20px] font-black text-[var(--foreground)]">{active}</span>
          </div>
          <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">à venda</p>
        </Link>
        
        <Link href="/notificacoes" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[110px] shadow-sm group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 transition-colors">
              <MessageCircle size={20} />
            </div>
            {/* Mock: Bolinha de notificação se houver negociações */}
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-2 mr-1"></span>
          </div>
          <p className="text-[14px] font-bold text-[var(--foreground)] tracking-tight mt-2">negociações</p>
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
      </section>

      {/* ── Para Agitar Sua Loja ── */}
      <section className="px-4 mt-8">
        <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight mb-4">para agitar sua loja</h2>
        <div className="grid grid-cols-2 gap-3">
          
          <Link href="/vendas/promocoes" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2 shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Tags size={16} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">promoções</p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5 leading-tight">crie descontos para vender mais rápido</p>
            </div>
          </Link>

          <Link href="/vendas/megafone" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2 shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Megaphone size={16} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">megafone</p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5 leading-tight">dê um up e coloque seus itens no topo</p>
            </div>
          </Link>

          <Link href="/vendas/metricas" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2 shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-[var(--color-celadon)]/30 dark:bg-[var(--color-celadon)]/10 flex items-center justify-center text-[var(--color-pine)] dark:text-[var(--color-celadon)]">
              <BarChart2 size={16} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">minhas métricas</p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5 leading-tight">acompanhe as visitas e curtidas</p>
            </div>
          </Link>

          <Link href="/configuracoes" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2 shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Settings size={16} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">configurações</p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5 leading-tight">edite seu perfil, endereço e conta</p>
            </div>
          </Link>

        </div>
      </section>

      {/* ── Kloop Pro ── */}
      <section className="px-4 mt-6">
        <Link href="/pro" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
              <PackageOpen size={24} />
            </div>
            <div>
              <p className="text-[15px] font-black text-[var(--foreground)]">kloop pro</p>
              <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">mande uma sacola, a gente vende tudo.</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </Link>
      </section>

      {/* ── Ajuda ── */}
      <section className="px-4 mt-3">
        <Link href="/ajuda" className="bg-white dark:bg-[var(--color-pine)] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm group">
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

      {/* ── FAB Fixo (Criar Anúncio) ── */}
      <div className="fixed bottom-[80px] md:bottom-8 left-1/2 -translate-x-1/2 z-30 w-full px-4 max-w-sm">
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