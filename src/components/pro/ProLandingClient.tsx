"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft, Package, Truck, Camera, Crown, X,
  CheckCircle2, XCircle, ChevronRight, LayoutDashboard,
} from "lucide-react"

interface Props {
  planSlug?: string
  hasActiveLot?: boolean
}

const STEPS = [
  {
    icon: Package,
    title: "comece separando roupas e acessórios",
    description:
      "em uma única caixa, coloque 10 ou mais peças. vale roupas e acessórios adultos e infantis, em perfeito estado de conservação.",
    cta: "confira o que a gente aceita",
  },
  {
    icon: Truck,
    title: "embale suas peças e envie tudo pra cá",
    description:
      "você pode usar uma caixa qualquer ou pedir a sacola do kloop pro. depois, envie pelos correios (grátis) ou peça coleta em casa (R$ 20).",
    cta: "confira como enviar suas peças",
  },
  {
    icon: Camera,
    title: "fotografia, anúncio e venda é com a gente",
    description:
      "a gente fotografa bonito, coloca à venda, negocia e envia ao comprador. por esses serviços, temos uma comissão de 40% — 60% é sempre seu.",
    cta: "entenda melhor nossas tarifas",
  },
]

const ACCEPTED = [
  "Roupas e acessórios adultos e infantis",
  "Peças em perfeito estado de conservação",
  "Mínimo de 10 peças por lote",
  "Bolsas, calçados e bijuterias",
  "Marcas nacionais e internacionais",
]

const NOT_ACCEPTED = [
  "Peças com manchas, rasgos ou defeitos",
  "Roupas de cama, banho ou mesa",
  "Itens íntimos (lingerie, meias)",
  "Réplicas ou itens falsificados",
]

const BRANDS = [
  "Schutz", "Arezzo", "Zara", "Levi's", "Nike", "Farm",
  "Adidas", "Ray-Ban", "Calvin Klein", "Lacoste", "Vans",
  "Gap", "Animale", "Tommy", "Osklen", "Le Lis Blanc",
]

export function ProLandingClient({ planSlug = "basic", hasActiveLot = false }: Props) {
  const router = useRouter()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const canSend = planSlug === "pro" || planSlug === "premium"

  function handleCTA() {
    if (!canSend) {
      setShowUpgrade(true)
      return
    }
    router.push("/pro/anuncio")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Voltar"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={18} className="text-[var(--foreground)]" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-black text-[var(--foreground)]">kloop</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-teal)] text-white text-[11px] font-black tracking-wide">PRO</span>
            </div>
          </div>
          <Link
            href="/pro/dashboard"
            className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 dark:text-sage hover:text-[var(--color-teal)] transition-colors"
          >
            <LayoutDashboard size={14} />
            {hasActiveLot ? "meu lote" : "painel"}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-32">

        {/* Hero */}
        <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] px-6 pt-10 pb-12 relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-56 h-56 bg-[var(--color-teal)]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-[var(--color-celadon)]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-celadon)] mb-3">kloop pro</p>
            <h1 className="text-[28px] font-black text-white leading-tight mb-4">
              cuidamos de tudo pra você, da fotografia às vendas
            </h1>
            <p className="text-[14px] text-white/70 leading-relaxed mb-6">
              você manda suas roupas, a gente fotografa, anuncia e negocia.
              feita a venda, é só esperar o dindin chegar. moleza que chama.
            </p>
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/30"
            >
              vender no kloop pro
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Como funciona */}
        <div className="px-4 pt-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-2">passo a passo</p>
          <h2 className="text-[20px] font-black text-[var(--foreground)] mb-6">como funciona esse super serviço</h2>

          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                        <Icon size={18} className="text-[var(--color-teal)]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-black text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-2 py-0.5 rounded-full">
                          {i + 1}
                        </span>
                        <p className="text-[14px] font-black text-[var(--foreground)]">{step.title}</p>
                      </div>
                      <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mb-2">{step.description}</p>
                      <button className="text-[11px] font-bold text-[var(--color-teal)] hover:underline">
                        {step.cta} →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* O que aceitamos */}
        <div className="px-4 pt-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-2">itens aceitos</p>
          <h2 className="text-[20px] font-black text-[var(--foreground)] mb-1">a gente garante qualidade pra freguesia</h2>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-5 leading-relaxed">
            um time olha com carinho pra sua roupa, fotografa e anuncia. tudo pra garantir peças em bom estado e mais chances de vender.
          </p>
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-5 border-b border-gray-50 dark:border-white/5">
              <p className="text-[12px] font-black uppercase tracking-wide text-green-600 dark:text-green-400 mb-3">aceitamos</p>
              <div className="space-y-2">
                {ACCEPTED.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[var(--foreground)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-[12px] font-black uppercase tracking-wide text-red-500 mb-3">não aceitamos</p>
              <div className="space-y-2">
                {NOT_ACCEPTED.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-gray-500 dark:text-sage">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comissão */}
        <div className="px-4 pt-8">
          <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-2">nossa comissão</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[40px] font-black text-white leading-none">60%</span>
                <span className="text-[16px] font-black text-white/60">é seu</span>
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed">
                por cada venda concluída, você fica com 60% do valor. a gente fica com 40% pelos serviços de fotografia, anúncio e logística.
              </p>
            </div>
          </div>
        </div>

        {/* Marcas */}
        <div className="pt-10">
          <div className="px-4 mb-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-2">marcas em destaque</p>
            <h2 className="text-[20px] font-black text-[var(--foreground)]">marcando presença, vendendo muito</h2>
            <p className="text-[13px] text-gray-500 dark:text-sage mt-1">
              as marcas mais queridas do brasil vendem muito mais rápido e por um preço ótimo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 px-4">
            {BRANDS.map((brand) => (
              <span
                key={brand}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 text-[12px] font-bold text-gray-600 dark:text-sage"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Dúvidas */}
        <div className="px-4 pt-10">
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 text-center">
            <p className="text-[14px] font-bold text-[var(--foreground)] mb-1">ainda tem dúvidas?</p>
            <p className="text-[12px] text-gray-500 dark:text-sage mb-3">entenda nossos termos e tarifas antes de enviar seu lote.</p>
            <Link
              href="/ajuda"
              className="text-[12px] font-bold text-[var(--color-teal)] hover:underline"
            >
              central de ajuda →
            </Link>
          </div>
        </div>

      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-30 w-full px-4 max-w-sm">
        <button
          onClick={handleCTA}
          className="w-full px-6 py-4 rounded-full bg-[var(--color-teal)] text-white font-black text-[15px] shadow-lg shadow-[var(--color-teal)]/30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          vender no kloop pro
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Modal upgrade */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgrade(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-[var(--color-pine)] rounded-t-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-black text-[var(--foreground)]">recurso exclusivo</h3>
              <button onClick={() => setShowUpgrade(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <X size={16} className="text-[var(--foreground)]" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                <Crown size={28} className="text-[var(--color-teal)]" />
              </div>
            </div>
            <p className="text-[14px] text-gray-500 dark:text-sage text-center leading-relaxed mb-6">
              O envio de lotes está disponível para assinantes{" "}
              <span className="font-bold text-[var(--foreground)]">Kloop Pro</span> e{" "}
              <span className="font-bold text-[var(--foreground)]">Kloop Premium</span>.
            </p>
            <Link
              href="/assinatura"
              className="w-full py-4 bg-[var(--color-teal)] text-white rounded-2xl font-black text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-teal)]/20 block text-center"
            >
              <Crown size={16} />
              ver planos de assinatura
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
