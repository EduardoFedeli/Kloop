import { CircuitBackground } from "@/components/layout/CircuitBackground"
import { SobreComunidadesContent } from "@/components/comunidades/SobreComunidadesContent"

export const metadata = { title: "O que é o Kloop Comunidades — Kloop" }

export default function SobreComunidadesPage() {
  return (
    <div className="relative min-h-[80vh] -mx-4 -mt-6 px-4 py-8" style={{ background: "var(--color-eclipse)" }}>
      <CircuitBackground />
      <SobreComunidadesContent />
    </div>
  )
}
