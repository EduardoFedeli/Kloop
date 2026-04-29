import Link from 'next/link'
import { Tags, ArrowLeft } from 'lucide-react'

export default function PromocoesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 py-16 flex flex-col items-center text-center flex-1 justify-center">
        <div className="w-24 h-24 rounded-3xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center mb-8">
          <Tags size={48} className="text-pink-500 dark:text-pink-400" strokeWidth={1.5} />
        </div>

        <p className="text-[12px] font-black uppercase tracking-widest text-pink-500 dark:text-pink-400 mb-3">em breve</p>
        <h1 className="text-[28px] font-black text-[var(--foreground)] leading-tight tracking-tight mb-4">
          promoções
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-sage leading-relaxed max-w-sm">
          crie cupons e descontos pra acelerar suas vendas. defina um percentual ou valor fixo e deixe o kloop divulgar pra você.
        </p>

        <div className="mt-10 w-full max-w-xs">
          <div className="bg-pink-50 dark:bg-pink-500/10 rounded-2xl p-4 text-left">
            <p className="text-[13px] font-black text-pink-700 dark:text-pink-300 mb-1">o que vai ter</p>
            <ul className="text-[13px] text-gray-600 dark:text-sage space-y-1">
              <li>· cupons de desconto por porcentagem</li>
              <li>· promoções por tempo limitado</li>
              <li>· desconto automático no checkout</li>
            </ul>
          </div>
        </div>

        <Link
          href="/vendas"
          className="mt-10 inline-flex items-center gap-2 text-[14px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] hover:underline"
        >
          <ArrowLeft size={16} /> voltar pras vendas
        </Link>
      </div>
    </div>
  )
}
