"use client"

import { useState } from "react"
import { CommunityBuildingShowcase } from "./CommunityBuildingShowcase"

export function ComunidadesViewToggler({ children }: { children: React.ReactNode }) {
  const [showShowcase, setShowShowcase] = useState(true)

  if (showShowcase) {
    return (
      <div className="relative z-10 w-full mt-8">
        <CommunityBuildingShowcase onContinue={() => setShowShowcase(false)} />
      </div>
    )
  }

  return <>{children}</>
}
