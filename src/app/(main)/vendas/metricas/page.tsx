import Link from 'next/link'
import { BarChart2, ArrowLeft } from 'lucide-react'

export default function MetricasPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 py-16 flex flex-col items-center text-center flex-1 justify-center">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-celadon)]/30 dark:bg-[var(--color-celadon)]/10 flex items-center justify-center mb-8">
          <BarChart2 size={48} className="text-[var(--color-airforce)] dark:text-[var(--color-celadon)]" strokeWidth={1.5} />
        </div>

        <p className="text-[12px] font-black uppercase tracking-widest text-[var(--color-teal)] dark:text-[var(--color-celadon)] mb-3">em breve</p>
        <h1 className="text-[28px] font-black text-[var(--foreground)] leading-tight tracking-tight mb-4">
          minhas métricas
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-sage leading-relaxed max-w-sm">
          acompanhe o desempenho dos seus anúncios em tempo real. veja quantas pessoas visualizaram, curtiram e mandaram mensagem.
        </p>

        <div className="mt-10 w-full max-w-xs">
          <div className="bg-[var(--color-celadon)]/20 dark:bg-[var(--color-celadon)]/10 rounded-2xl p-4 text-left">
            <p className="text-[13px] font-black text-[var(--color-airforce)] dark:text-[var(--color-celadon)] mb-1">o que vai ter</p>
            <ul className="text-[13px] text-gray-600 dark:text-sage space-y-1">
              <li>· visualizações por anúncio</li>
              <li>· taxa de conversão (visita → venda)</li>
              <li>· favoritos e mensagens recebidas</li>
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
