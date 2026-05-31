import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { db } from "@/lib/db"

export const metadata = { title: "Marcas — Kloop" }

export default async function MarcasPage() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  })

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/search"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} className="text-[var(--foreground)]" />
          </Link>
          <div>
            <h1 className="text-[16px] font-black text-[var(--foreground)]">marcas queridinhas</h1>
            <p className="text-[12px] text-gray-500 dark:text-sage">{brands.length} marcas disponíveis</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {brands.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-sage">
            <p className="text-[15px] font-medium">Nenhuma marca cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/marca/${brand.slug}`}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 hover:border-[var(--color-teal)]/30 dark:hover:border-[var(--color-teal)]/30 transition-all group"
              >
                {/* Logo / Iniciais */}
                <div className="w-12 h-12 rounded-xl bg-[var(--color-pine)] flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  {brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <span className="text-[10px] font-black text-white uppercase px-1 text-center break-words leading-tight">
                      {brand.name.substring(0, 4)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black text-[var(--foreground)] truncate">{brand.name}</p>
                </div>

                <ChevronRight size={16} className="text-gray-300 dark:text-white/20 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
