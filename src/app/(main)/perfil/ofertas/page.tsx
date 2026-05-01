import Link from 'next/link'

export default function OfertasPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
      <span className="text-7xl select-none">🤝</span>
      <div className="space-y-2">
        <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">tão bom negociar um negocinho</h3>
        <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
          o preço não convenceu? faça uma oferta e negocie diretamente com o vendedor.
        </p>
      </div>
      <Link
        href="/search"
        className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
      >
        explorar produtos
      </Link>
    </div>
  )
}
