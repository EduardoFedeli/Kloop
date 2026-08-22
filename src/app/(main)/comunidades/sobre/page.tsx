import Link from "next/link"
import { Building2, ArrowLeft, ShieldCheck, Tag, Users } from "lucide-react"

export const metadata = { title: "O que são Comunidades — Kloop" }

const PONTOS = [
  {
    icon: ShieldCheck,
    title: "Só quem mora ali vê",
    text: "Os anúncios de uma comunidade ficam visíveis apenas para os moradores confirmados — mais confiança pra comprar e vender pertinho de casa.",
  },
  {
    icon: Tag,
    title: "Comece pelo condomínio",
    text: "Hoje o Kloop atende comunidades de condomínios, criadas junto com o síndico ou responsável do prédio.",
  },
  {
    icon: Users,
    title: "Vizinhos primeiro",
    text: "Vender e comprar de quem mora no mesmo prédio facilita a entrega, reduz o frete e fortalece a vizinhança.",
  },
]

export default function SobreComunidadesPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <Link href="/comunidades" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-400 dark:text-sage mb-6 hover:text-[var(--color-teal)] dark:hover:text-[var(--color-celadon)] transition-colors">
        <ArrowLeft size={15} />
        voltar
      </Link>

      <div className="w-12 h-12 rounded-2xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
        <Building2 size={24} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
      </div>

      <h1 className="text-[22px] font-black text-[var(--foreground)] tracking-tight leading-tight">
        o que são Comunidades Kloop
      </h1>
      <p className="text-[14px] text-gray-500 dark:text-sage mt-2 leading-relaxed">
        é um dos nossos maiores diferenciais: um espaço de desapego exclusivo pra quem vive no mesmo lugar que você.
      </p>

      <div className="mt-8 space-y-5">
        {PONTOS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon size={17} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">{title}</p>
              <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-5">
        <p className="text-[13px] font-bold text-[var(--foreground)]">quer trazer o Kloop pro seu condomínio?</p>
        <p className="text-[12px] text-gray-500 dark:text-sage mt-1 leading-relaxed">
          fale com o síndico ou responsável do seu prédio — hoje as comunidades são criadas em conjunto com a administração de cada condomínio.
        </p>
      </div>
    </div>
  )
}
