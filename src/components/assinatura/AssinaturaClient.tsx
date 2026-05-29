"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Crown, Zap, Rocket, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToPlan } from "@/lib/actions/subscription"
import { toast } from "sonner"

interface PlanFeature {
  text: string
  highlight?: boolean
}

interface Plan {
  id: string
  name: string
  priceLabel: string
  priceSuffix: string
  description: string
  badge?: string
  isDark: boolean
  features: PlanFeature[]
  ctaText: string
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Kloop",
    priceLabel: "Grátis",
    priceSuffix: "para sempre",
    description: "Para quem está começando a desapegar",
    isDark: false,
    ctaText: "Continuar com o Kloop",
    features: [
      { text: "Até 20 anúncios ativos" },
      { text: "5 megafones por semana" },
      { text: "Taxa de 14% por venda" },
    ],
  },
  {
    id: "premium",
    name: "Kloop Pro",
    priceLabel: "R$ 14,99",
    priceSuffix: "/mês",
    description: "Para quem vende de verdade",
    isDark: true,
    ctaText: "Assinar Kloop Pro",
    features: [
      { text: "Anúncios ilimitados", highlight: true },
      { text: "15 megafones por semana", highlight: true },
      { text: "Taxa reduzida de 12%", highlight: true },
      { text: "Loja personalizável (Banner, Cores)", highlight: true },
    ],
  },
]

function PlanIcon({ id, isDark }: { id: string; isDark: boolean }) {
  const base = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"

  if (id === "basic") return (
    <div className={cn(base, "bg-gray-100 dark:bg-white/10")}>
      <Zap size={18} className="text-gray-500 dark:text-white/60" />
    </div>
  )
  return (
    <div className={cn(base, "bg-amber-400/15")}>
      <Rocket size={18} className="text-amber-400" />
    </div>
  )
}

function PlanCard({
  plan,
  isCurrent,
  onSubscribe,
  isPending
}: {
  plan: Plan
  isCurrent: boolean
  onSubscribe: (planId: string) => void
  isPending: boolean
}) {
  const isBasic = plan.id === "basic"
  const isPremium = plan.id === "premium"

  const cardClasses = cn(
    "relative rounded-3xl p-5 overflow-hidden shrink-0 snap-center w-[85vw] sm:w-[320px] md:w-full",
    isBasic && "bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5",
    isPremium && "border border-amber-400/25"
  )

  const textColor = plan.isDark ? "text-white" : "text-[var(--foreground)]"
  const subtextColor = plan.isDark ? "text-white/55" : "text-gray-500 dark:text-sage"
  const featureColor = plan.isDark ? "text-white/85" : "text-gray-700 dark:text-white/80"
  const checkColor = isPremium ? "text-amber-400" : "text-[var(--color-teal)]"

  const ctaClasses = cn(
    "w-full py-3 rounded-2xl text-[14px] font-black transition-all flex items-center justify-center gap-2",
    isCurrent && "border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30 cursor-default",
    !isCurrent && isBasic && "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/15",
    !isCurrent && isPremium && "bg-gradient-to-r from-amber-400 to-amber-500 text-[var(--color-pine)] hover:opacity-90",
    isPending && "opacity-70 cursor-not-allowed"
  )

  return (
    <div className={cardClasses}>
      {isPremium && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-pine)] via-[var(--color-forest)] to-[#0c2218] -z-0" />
      )}
      {isPremium && (
        <div className="absolute right-[-30px] top-[-30px] w-40 h-40 rounded-full blur-3xl pointer-events-none bg-amber-400/10" />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <PlanIcon id={plan.id} isDark={plan.isDark} />
            <div>
              <p className={cn("text-[15px] font-black leading-tight", textColor)}>{plan.name}</p>
              <p className={cn("text-[12px] mt-0.5", subtextColor)}>{plan.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {plan.badge && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-celadon)]/20 text-[var(--color-celadon)] text-[10px] font-black tracking-wide whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            {isCurrent && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 text-[10px] font-black tracking-wide">
                ATUAL
              </span>
            )}
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-[32px] font-black leading-none tracking-tight", textColor)}>
              {plan.priceLabel}
            </span>
            {plan.priceSuffix && (
              <span className={cn("text-[13px] font-medium", subtextColor)}>{plan.priceSuffix}</span>
            )}
          </div>
        </div>

        <ul className="space-y-2.5 mb-8 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check size={14} className={cn("mt-0.5 flex-shrink-0", checkColor)} strokeWidth={2.5} />
              <span className={cn("text-[13px] leading-snug", feature.highlight ? featureColor : subtextColor)}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <button
            disabled={isCurrent || isPending}
            onClick={() => onSubscribe(plan.id)}
            className={ctaClasses}
          >
            {isPending && !isCurrent ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isCurrent ? (
              "Seu plano atual"
            ) : (
              plan.ctaText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AssinaturaClient({ currentPlanSlug }: { currentPlanSlug: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubscribe = (planId: string) => {
    startTransition(async () => {
      const result = await subscribeToPlan(planId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Plano atualizado com sucesso!")
      }
    })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} className="text-[var(--foreground)]" />
          </button>
          <div>
            <h1 className="text-[16px] font-black text-[var(--foreground)]">Escolha seu plano</h1>
            <p className="text-[12px] text-gray-500 dark:text-sage">
              Cancele quando quiser · Megafones variam por plano
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Destaque da feature Turbinar — gratuita para todos */}
        {/* Scroll Horizontal no Mobile, Grid no Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:max-w-2xl md:mx-auto md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlanSlug}
              onSubscribe={handleSubscribe}
              isPending={isPending}
            />
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-white/25 mt-4 leading-relaxed">
          Cancele quando quiser. Cobrado mensalmente.{" "}
          <Link href="/ajuda" className="underline hover:text-gray-600 dark:hover:text-white/40 transition-colors">
            Central de ajuda
          </Link>
        </p>
      </div>
    </div>
  )
}