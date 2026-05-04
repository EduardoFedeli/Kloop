"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Crown, Zap, Rocket, Building2, ChevronRight, Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToPlan } from "@/lib/actions/subscription"
import { toast } from "sonner"

type PlanTab = "pessoal" | "empresas"

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
  isEnterprise?: boolean
  isDark: boolean
  features: PlanFeature[]
  ctaText: string
  ctaHref: string
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Kloop Basic",
    priceLabel: "Grátis",
    priceSuffix: "para sempre",
    description: "Para quem está começando a desapegar",
    isDark: false,
    ctaText: "Mudar para o Basic",
    ctaHref: "#",
    features: [
      { text: "Até 20 anúncios ativos" },
      { text: "Usar até 30% do saldo em compras" },
      { text: "Vendas geram 5% de cashback" },
      { text: "Compras geram 2% de cashback" },
    ],
  },
  {
    id: "pro",
    name: "Kloop Pro",
    priceLabel: "R$ 29,90",
    priceSuffix: "/mês",
    description: "Para vendedores ativos",
    badge: "MAIS POPULAR",
    isDark: true,
    ctaText: "Assinar Kloop Pro",
    ctaHref: "#",
    features: [
      { text: "Até 40 anúncios ativos", highlight: true }, // Melhor que Basic
      { text: "Usar até 30% do saldo em compras" }, // Igual ao Basic
      { text: "Vendas geram 8% de cashback", highlight: true }, // Melhor que Basic
      { text: "Compras geram 4% de cashback", highlight: true }, // Melhor que Basic
      { text: "Acesso ao Kloop Pro", highlight: true }, // Novo no Pro
      { text: "Função Turbinar", highlight: true }, // Novo no Pro
    ],
  },
  {
    id: "premium",
    name: "Kloop Premium",
    priceLabel: "R$ 59,90",
    priceSuffix: "/mês",
    description: "Para quem vende de verdade",
    isDark: true,
    ctaText: "Assinar Kloop Premium",
    ctaHref: "#",
    features: [
      { text: "Até 60 anúncios ativos", highlight: true }, // Melhor que Pro
      { text: "Usar até 40% do saldo em compras", highlight: true }, // Melhor que Pro
      { text: "Vendas geram 8% de cashback" }, // Igual ao Pro
      { text: "Compras geram 4% de cashback" }, // Igual ao Pro
      { text: "Acesso ao Kloop Pro" }, // Igual ao Pro
      { text: "Função Turbinar" }, // Igual ao Pro
      { text: "Megafonar até 10 produtos/semana", highlight: true }, // Novo no Premium
      { text: "Loja personalizável (Banner, URL, Cores)", highlight: true }, // Novo no Premium
    ],
  },
  {
    id: "enterprise",
    name: "Kloop Enterprise",
    priceLabel: "Sob consulta",
    priceSuffix: "",
    description: "Para grandes operadores e marcas",
    isEnterprise: true,
    isDark: true,
    ctaText: "Falar com o time",
    ctaHref: "https://wa.me/5511999999999",
    features: [
      { text: "Anúncios ilimitados", highlight: true },
      { text: "Cashback personalizado", highlight: true },
      { text: "Gerente de conta dedicado", highlight: true },
      { text: "Integrações e API", highlight: true },
      { text: "Dashboard de métricas avançado", highlight: true },
      { text: "Suporte prioritário 24/7", highlight: true },
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
  if (id === "pro") return (
    <div className={cn(base, isDark ? "bg-[var(--color-celadon)]/15" : "bg-[var(--color-teal)]/10")}>
      <Crown size={18} className={isDark ? "text-[var(--color-celadon)]" : "text-[var(--color-teal)]"} />
    </div>
  )
  if (id === "premium") return (
    <div className={cn(base, "bg-amber-400/15")}>
      <Rocket size={18} className="text-amber-400" />
    </div>
  )
  return (
    <div className={cn(base, "bg-violet-500/15")}>
      <Building2 size={18} className="text-violet-400" />
    </div>
  )
}

function PlanCard({ 
  plan, 
  isCurrent, 
  onSubscribe, 
  isPending 
}: { 
  plan: Plan; 
  isCurrent: boolean; 
  onSubscribe: (planId: string) => void;
  isPending: boolean;
}) {
  const isBasic = plan.id === "basic"
  const isPro = plan.id === "pro"
  const isPremium = plan.id === "premium"
  const isEnterprise = plan.isEnterprise

  const cardClasses = cn(
    "relative rounded-3xl p-5 overflow-hidden shrink-0 snap-center w-[85vw] sm:w-[320px] md:w-full",
    isBasic && "bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5",
    isPro && "bg-[var(--color-pine)] border border-[var(--color-teal)]/40",
    isPremium && "border border-amber-400/25",
    isEnterprise && "border border-violet-500/25"
  )

  const textColor = plan.isDark ? "text-white" : "text-[var(--foreground)]"
  const subtextColor = plan.isDark ? "text-white/55" : "text-gray-500 dark:text-sage"
  const featureColor = plan.isDark ? "text-white/85" : "text-gray-700 dark:text-white/80"
  const checkColor = isPremium
    ? "text-amber-400"
    : isEnterprise
    ? "text-violet-400"
    : isPro
    ? "text-[var(--color-celadon)]"
    : "text-[var(--color-teal)]"

  const ctaClasses = cn(
    "w-full py-3 rounded-2xl text-[14px] font-black transition-all flex items-center justify-center gap-2",
    isCurrent && "border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30 cursor-default",
    !isCurrent && isBasic && "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/15",
    !isCurrent && isPro && "bg-[var(--color-teal)] text-white hover:opacity-90",
    !isCurrent && isPremium && "bg-gradient-to-r from-amber-400 to-amber-500 text-[var(--color-pine)] hover:opacity-90",
    !isCurrent && isEnterprise && "border border-violet-500/50 text-violet-400 hover:bg-violet-500/10",
    isPending && "opacity-70 cursor-not-allowed"
  )

  return (
    <div className={cardClasses}>
      {isPremium && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-pine)] via-[var(--color-forest)] to-[#0c2218] -z-0" />
      )}
      {isEnterprise && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0d2e] via-[var(--color-pine)] to-[#0c1a10] -z-0" />
      )}
      {isPremium && (
        <div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {isEnterprise && (
        <div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {isPro && (
        <div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-[var(--color-teal)]/10 rounded-full blur-3xl pointer-events-none" />
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
          {plan.isEnterprise ? (
            <Link
              href={plan.ctaHref}
              target="_blank"
              className={ctaClasses}
            >
              {plan.ctaText} <ChevronRight size={16} />
            </Link>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}

export function AssinaturaClient({ currentPlanSlug }: { currentPlanSlug: string }) {
  const [tab, setTab] = useState<PlanTab>("pessoal")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubscribe = (planId: string) => {
    startTransition(async () => {
      const result = await subscribeToPlan(planId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Plano atualizado com sucesso!`)
      }
    })
  }

  // Filtra os planos dinamicamente com base na aba ativa
  const currentPlans = tab === "pessoal" 
    ? plans.filter(p => !p.isEnterprise)
    : plans.filter(p => p.id === "basic" || p.isEnterprise)

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
            <p className="text-[12px] text-gray-500 dark:text-sage">Desbloqueie mais com Kloop Pro e Premium</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="flex justify-center mt-6 mb-8">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-full gap-1">
            {(["pessoal", "empresas"] as PlanTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-6 py-2 rounded-full text-[13px] font-bold transition-all",
                  tab === t
                    ? "bg-white dark:bg-[var(--color-pine)] text-[var(--foreground)] shadow-sm"
                    : "text-gray-500 dark:text-white/40 hover:text-[var(--foreground)] dark:hover:text-white/70"
                )}
              >
                {t === "pessoal" ? "Pessoal" : "Empresas"}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Horizontal no Mobile, Grid no Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {currentPlans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isCurrent={plan.id === currentPlanSlug} 
              onSubscribe={handleSubscribe}
              isPending={isPending}
            />
          ))}
        </div>

        {tab === "pessoal" && (
          <p className="text-center text-[11px] text-gray-400 dark:text-white/25 mt-4 leading-relaxed">
            Cancele quando quiser. Cobrado mensalmente.{" "}
            <Link href="/ajuda" className="underline hover:text-gray-600 dark:hover:text-white/40 transition-colors">
              Central de ajuda
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}