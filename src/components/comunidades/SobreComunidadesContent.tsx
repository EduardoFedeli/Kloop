"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { CommunityBuildingShowcase } from "./CommunityBuildingShowcase"

export function SobreComunidadesContent() {
  const router = useRouter()

  return (
    <div className="relative z-10 max-w-7xl mx-auto">
      <Link
        href="/comunidades"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sky-ice hover:text-neon-lift transition-colors"
      >
        <ArrowLeft size={15} />
        voltar
      </Link>

      <CommunityBuildingShowcase onContinue={() => router.push("/comunidades")} />
    </div>
  )
}
