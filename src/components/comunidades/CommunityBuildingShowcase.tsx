"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { BuildingScene } from "./BuildingScene"
import { ShieldCheck, Users, Tag, Leaf, ArrowRight } from "lucide-react"
import gsap from "gsap"

const BENEFITS = [
  {
    id: "security",
    title: "Só vizinhos veem",
    description: "Os anúncios de uma comunidade ficam visíveis só para moradores confirmados do seu condomínio.",
    icon: ShieldCheck,
  },
  {
    id: "community",
    title: "Feito pra quem mora perto",
    description: "Conecta você com quem já divide o mesmo prédio, sem precisar de frete ou de combinar com um estranho.",
    icon: Users,
  },
  {
    id: "economy",
    title: "Menos taxas, mais economia",
    description: "Comprar e vender pertinho de casa custa menos pra todo mundo envolvido.",
    icon: Tag,
  },
  {
    id: "sustainability",
    title: "Economia circular de verdade",
    description: "Cada peça que muda de dono ali do lado é menos desperdício e mais vida útil pros objetos.",
    icon: Leaf,
  }
]

const CALL_TO_ACTION_TEXTS = [
  "só quem mora ali vê",
  "seu vizinho primeiro",
  "compre e venda sem sair do prédio",
  "uma nova vida pra cada peça"
]

export function CommunityBuildingShowcase({ onContinue }: { onContinue?: () => void }) {
  const [activeZone, setActiveZone] = useState(0)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  // Use a fallback for reduced motion / mobile, and delay Canvas to client-side only
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mql.matches)
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mql.addEventListener("change", handler)
    
    return () => {
      mql.removeEventListener("change", handler)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Animate tooltip on zone change
  useEffect(() => {
    if (isReducedMotion || !tooltipRef.current || !mounted) return
    
    gsap.fromTo(
      tooltipRef.current,
      { opacity: 0, y: 10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
    )
  }, [activeZone, isReducedMotion, mounted])

  const activeBenefit = BENEFITS[activeZone] || BENEFITS[0]
  const activeCTA = CALL_TO_ACTION_TEXTS[activeZone] || CALL_TO_ACTION_TEXTS[0]
  const ActiveIcon = activeBenefit.icon

  return (
    <section className="py-24 relative z-10 w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Content */}
        <div className="space-y-8">
          <div>
            <p className="text-neon-lift font-bold tracking-wider text-sm uppercase mb-3">Kloop Comunidades</p>
            <h2 className="text-4xl md:text-5xl font-black text-neon-mist mb-6">
              O que é o <span className="text-neon-lift">Kloop Comunidades?</span>
            </h2>
            <p className="text-sky-ice/80 text-lg max-w-md leading-relaxed">
              Um feed de compra e venda exclusivo para quem já mora perto de você — hoje, moradores do mesmo condomínio.
            </p>
          </div>

          <div className="space-y-6">
            {BENEFITS.map((benefit, index) => {
              const isActive = index === activeZone
              const Icon = benefit.icon
              
              return (
                <div 
                  key={benefit.id} 
                  className={`flex gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    isActive ? "bg-neon-lift/10 border border-neon-lift/30" : "opacity-60"
                  }`}
                >
                  <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isActive ? "bg-neon-lift/20 text-neon-lift" : "bg-eclipse/50 text-sky-ice/50"
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                      isActive ? "text-neon-mist" : "text-sky-ice"
                    }`}>
                      {benefit.title}
                    </h3>
                    <p className="text-sky-ice/70 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: 3D Scene */}
        <div className="relative h-[500px] lg:h-[700px] w-full rounded-3xl overflow-hidden flex items-center justify-center">
          
          {/* Circular platform glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-neon-lift/5 blur-3xl pointer-events-none" />

          {/* 3D Canvas */}
          {!mounted ? null : (!isReducedMotion) ? (
             <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
                  <Suspense fallback={null}>
                    <BuildingScene onZoneChange={setActiveZone} />
                  </Suspense>
                </Canvas>
             </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-sky-ice/50 bg-eclipse border border-void-navy rounded-3xl">
               <BuildingPlaceholderStatic />
               <p className="mt-8 text-sm">3D Interativo desativado (economia de recursos)</p>
            </div>
          )}

          {/* Dynamic Tooltip (HTML overlay) */}
          {(!isReducedMotion && mounted) && (
            <div 
              ref={tooltipRef}
              className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 bg-eclipse/90 backdrop-blur-md border border-neon-lift/20 p-4 rounded-2xl flex items-center gap-4 max-w-xs shadow-2xl pointer-events-none"
            >
              <div className="w-10 h-10 rounded-full bg-neon-lift/10 flex items-center justify-center flex-shrink-0">
                <ActiveIcon className="text-neon-lift" size={20} />
              </div>
              <p className="text-sm font-medium text-neon-mist leading-tight">
                {activeCTA}
              </p>
            </div>
          )}
          
          {/* CTA at the bottom right */}
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 z-20">
            <button
              onClick={onContinue}
              className="bg-neon-lift hover:bg-electric-sky text-eclipse font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all"
            >
              Ver comunidades <ArrowRight size={18} />
            </button>
            <span className="text-xs text-sky-ice/60">Voltar para minhas comunidades</span>
          </div>

          <div className="absolute bottom-8 left-8 text-xs text-neon-lift/60 animate-pulse pointer-events-none">
            {(!isReducedMotion && !isMobile) ? "Arraste para girar" : ""}
          </div>
        </div>

      </div>
    </section>
  )
}

function BuildingPlaceholderStatic() {
  return (
    <div className="w-48 h-64 border-4 border-void-navy rounded-xl bg-midnight-navy flex items-center justify-center opacity-50 relative">
      <div className="absolute -bottom-4 w-56 h-2 bg-neon-lift/20 rounded-full blur-sm" />
      <div className="w-8 h-8 rounded-full bg-neon-lift/20" />
    </div>
  )
}
