import Link from 'next/link'
import { Megaphone, ArrowLeft } from 'lucide-react'

export default function MegafonePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 py-16 flex flex-col items-center text-center flex-1 justify-center">
        <div className="w-24 h-24 rounded-3xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center mb-8">
          <Megaphone size={48} className="text-yellow-500 dark:text-yellow-400" strokeWidth={1.5} />
        </div>

        <p className="text-[12px] font-black uppercase tracking-widest text-yellow-500 dark:text-yellow-400 mb-3">em breve</p>
        <h1 className="text-[28px] font-black text-[var(--foreground)] leading-tight tracking-tight mb-4">
          megafone
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-sage leading-relaxed max-w-sm">
          impulsione seus anúncios e apareça pra mais gente na busca do kloop. com o megafone, seus produtos ficam no topo por mais tempo.
        </p>

        <div className="mt-10 w-full max-w-xs">
          <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl p-4 text-left">
            <p className="text-[13px] font-black text-yellow-700 dark:text-yellow-300 mb-1">o que vai ter</p>
            <ul className="text-[13px] text-gray-600 dark:text-sage space-y-1">
              <li>· destaque no feed e na busca</li>
              <li>· métricas de visualizações</li>
              <li>· planos por tempo ou por clique</li>
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
