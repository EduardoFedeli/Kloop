"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createProLot } from "@/lib/actions/proLot"

type ShippingMethod = "correios" | "coleta"

interface Props {
  withBag?: boolean
}

const OPTIONS = [
  {
    id: "correios" as ShippingMethod,
    icon: Package,
    title: "Correios",
    subtitle: "Gratuito",
    description: "Você embala e leva em qualquer agência dos Correios. A gente fornece o código de postagem.",
    badge: null,
    subtitleColor: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  },
  {
    id: "coleta" as ShippingMethod,
    icon: Truck,
    title: "Coleta em Casa",
    subtitle: "R$ 20,00",
    description: "Nosso parceiro coleta na sua casa em até 2 dias úteis. O valor é descontado do seu saldo KloopBank na primeira venda.",
    badge: "MAIS PRÁTICO",
    subtitleColor: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
]

export function ProOnboardingClient({ withBag }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<ShippingMethod | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleContinue() {
    if (!selected) return
    setError(null)
    startTransition(async () => {
      const method = selected === "correios" ? "CORREIOS" : "COLETA"
      const result = await createProLot(method, withBag ?? false)
      if ("error" in result) {
        setError(result.error)
        return
      }
      router.push(`/pro/sucesso?code=${result.code}`)
    })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-[var(--foreground)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black text-[var(--foreground)]">kloop</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-teal)] text-white text-[11px] font-black">PRO</span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-white/30">como você quer enviar?</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-teal)]" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10" />
        </div>

        <h1 className="text-[22px] font-black text-[var(--foreground)] mb-2">
          como você quer enviar suas peças?
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-sage mb-8 leading-relaxed">
          Escolha o método de envio. Lembre-se: mínimo de 10 peças por lote.
          {withBag && " Sua sacola do Kloop Pro será enviada junto."}
        </p>

        <div className="space-y-3 mb-8">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isSelected = selected === opt.id

            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "w-full text-left rounded-2xl p-5 border-2 transition-all",
                  isSelected
                    ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5 dark:bg-[var(--color-teal)]/10"
                    : "border-gray-100 dark:border-white/5 bg-white dark:bg-[var(--color-pine)] hover:border-gray-200 dark:hover:border-white/10"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected
                      ? "bg-[var(--color-teal)] text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50"
                  )}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-[15px] font-black text-[var(--foreground)]">{opt.title}</p>
                      <span className={cn("text-[11px] font-black px-2 py-0.5 rounded-full", opt.subtitleColor)}>
                        {opt.subtitle}
                      </span>
                      {opt.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed">{opt.description}</p>
                  </div>

                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    isSelected
                      ? "border-[var(--color-teal)] bg-[var(--color-teal)]"
                      : "border-gray-200 dark:border-white/20"
                  )}>
                    {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-[12px] text-gray-500 dark:text-sage leading-relaxed">
          Após confirmar, você receberá seu código de lote e as instruções de envio.
          Nossa equipe receberá suas peças, fotografará e publicará os anúncios na plataforma.
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
            <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-30 w-full px-4 max-w-sm">
        <button
          onClick={handleContinue}
          disabled={!selected || isPending}
          className={cn(
            "w-full px-6 py-4 rounded-full flex items-center justify-center font-black text-[15px] transition-all",
            selected && !isPending
              ? "bg-[var(--color-teal)] text-white shadow-lg shadow-[var(--color-teal)]/30 hover:scale-[1.02]"
              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 cursor-not-allowed"
          )}
        >
          {isPending ? "Confirmando..." : <>Continuar <ChevronRight size={18} className="ml-1" /></>}
        </button>
      </div>
    </div>
  )
}
