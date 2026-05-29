"use client"

import Link from "next/link"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

type PlanVariant = "basic" | "pro" | "premium" | "enterprise"

interface PlanBadgeProps {
  plan: PlanVariant
  className?: string
}

const variantStyles: Record<PlanVariant, string> = {
  basic: "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40",
  pro: "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40",
  premium: "bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400",
  enterprise: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
}

const planLabels: Record<PlanVariant, string> = {
  basic: "Kloop",
  pro: "Kloop",
  premium: "Kloop Pro",
  enterprise: "Enterprise",
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <Link href="/assinatura">
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold hover:opacity-75 transition-opacity",
          variantStyles[plan],
          className
        )}
      >
        {plan === "premium" && <Crown size={10} />}
        {planLabels[plan]}
      </span>
    </Link>
  )
}
