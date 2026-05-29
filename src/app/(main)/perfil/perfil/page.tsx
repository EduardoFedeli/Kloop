import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, Store, ChevronRight, Package } from 'lucide-react'
import { PlanBadge } from '@/components/ui/PlanBadge'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { AddressSection } from '@/components/profile/AddressSection'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PerfilPerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const [user] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        genderPreference: true,
        createdAt: true,
        addresses: { orderBy: { createdAt: 'asc' }, take: 1 },
        subscription: {
          include: { plan: { select: { name: true, maxActiveListings: true, slug: true } } },
        },
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
      },
    }),
    Promise.resolve(null),
  ])

  if (!user) redirect('/')

  const maxListings = user.subscription?.plan?.maxActiveListings ?? 5
  const activeCount = user._count.listings
  
  // Pega o slug da assinatura e garante a tipagem para o componente
  const userPlanSlug = (user.subscription?.plan?.slug as "basic" | "pro" | "premium" | "enterprise") || 'basic'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-black text-[var(--foreground)]">{user.name.toLowerCase()}</h1>
            <PlanBadge plan={userPlanSlug} />
          </div>
          <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">membro desde {formatDate(user.createdAt)}</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-teal)] text-white text-[13px] font-bold rounded-full hover:bg-[var(--color-pine)] transition-colors"
        >
          <PlusCircle size={15} />
          novo anúncio
        </Link>
      </div>

      {/* Editar perfil */}
      <section className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <h2 className="text-[14px] font-bold text-[var(--foreground)] mb-4">editar perfil</h2>
        <ProfileForm
          profile={{
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            genderPreference: user.genderPreference,
          }}
        />
      </section>

      {/* Endereço */}
      <section className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <h2 className="text-[14px] font-bold text-[var(--foreground)] mb-4">endereço de entrega</h2>
        <AddressSection addresses={user.addresses} />
      </section>

      {/* Minha loja */}
      <section>
        <Link
          href={`/profile/${user.id}`}
          className="flex items-center justify-between bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
              <Store size={22} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--foreground)]">minha loja</p>
              <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
                {activeCount} de {maxListings === -1 ? '∞' : maxListings} anúncios ativos
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-sage group-hover:text-[var(--color-teal)] dark:group-hover:text-[var(--color-celadon)] transition-colors" />
        </Link>
      </section>

      {/* Kloop Pro */}
      <section>
        <Link
          href="/pro/dashboard"
          className="flex items-center justify-between bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
              <Package size={22} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--foreground)]">kloop shop</p>
              <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">painel de lotes e vendas shop</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-sage group-hover:text-[var(--color-teal)] dark:group-hover:text-[var(--color-celadon)] transition-colors" />
        </Link>
      </section>
    </div>
  )
}