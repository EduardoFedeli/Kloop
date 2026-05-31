import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { KloopShopFilters } from '@/components/kloop-shop/KloopShopFilters'

export const dynamic = 'force-dynamic'

type SortOption = 'newest' | 'price_asc' | 'price_desc'
type ConditionFilter = 'ALL' | 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'

interface Props {
  searchParams: Promise<{ sort?: string; condition?: string }>
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom",
  FAIR: "Regular",
}

const CONDITION_COLOR: Record<string, string> = {
  NEW: "bg-green-100 text-green-700",
  LIKE_NEW: "bg-emerald-100 text-emerald-700",
  GOOD: "bg-blue-100 text-blue-700",
  FAIR: "bg-amber-100 text-amber-700",
}

const SORT_MAP: Record<SortOption, object> = {
  newest: { createdAt: 'desc' as const },
  price_asc: { priceCents: 'asc' as const },
  price_desc: { priceCents: 'desc' as const },
}

export default async function KloopShopPage({ searchParams }: Props) {
  const params = await searchParams
  const sort = (params.sort as SortOption) ?? 'newest'
  const condition = (params.condition as ConditionFilter) ?? 'ALL'

  const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest

  const products = await db.kloopShopProduct.findMany({
    where: {
      isActive: true,
      ...(condition !== 'ALL' ? { condition: condition as never } : {}),
    },
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      condition: true,
    },
  })

  const totalCount = await db.kloopShopProduct.count({ where: { isActive: true } })

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-pine) 0%, var(--color-emerald) 60%, var(--color-teal) 100%)' }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="pt-4 pb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[13px]"
            >
              <ArrowLeft size={14} />
              voltar
            </Link>
          </div>

          <div className="pb-8 pt-2 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
              <ShoppingBag size={32} className="text-white" strokeWidth={1.5} />
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] font-black text-white leading-tight">Kloop Shop</h1>
                <span className="inline-flex items-center gap-1 bg-[var(--color-celadon)] text-[var(--color-pine)] text-[10px] font-black px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} strokeWidth={3} />
                  loja oficial
                </span>
              </div>
              <p className="text-[13px] text-white/60 mt-1">
                {totalCount} {totalCount === 1 ? 'produto disponível' : 'produtos disponíveis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="bg-[var(--color-frosted)] dark:bg-white/4 border border-gray-100 dark:border-white/5 rounded-2xl p-4">
          <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
            A Kloop Shop é a loja oficial do Kloop. Aqui você encontra peças curadas e selecionadas pela nossa equipe, com garantia de qualidade e entrega confiável.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto px-4 pb-3">
        <KloopShopFilters currentSort={sort} currentCondition={condition} />
      </div>

      {/* Products */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="text-gray-300 dark:text-white/15 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-[16px] font-black text-[var(--foreground)]">
              {totalCount === 0 ? 'em breve' : 'nenhum resultado'}
            </p>
            <p className="text-[13px] text-gray-400 dark:text-sage mt-1">
              {totalCount === 0
                ? 'estamos preparando os melhores produtos para você.'
                : 'tente outros filtros.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-gray-400 dark:text-sage mb-3">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'} encontrado{products.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-[var(--color-frosted)] to-[var(--color-celadon)]/20 dark:from-[var(--color-forest)] dark:to-[var(--color-pine)] flex items-center justify-center">
                    <ShoppingBag size={32} className="text-[var(--color-teal)]/40" strokeWidth={1.5} />
                  </div>

                  <div className="p-3">
                    <p className="text-[13px] font-black text-[var(--foreground)] leading-tight line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-[11px] text-gray-400 dark:text-sage line-clamp-1 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[14px] font-black text-[var(--color-teal)]">
                        {formatPrice(product.priceCents)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CONDITION_COLOR[product.condition] ?? "bg-gray-100 text-gray-500"}`}>
                        {CONDITION_LABEL[product.condition] ?? product.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
