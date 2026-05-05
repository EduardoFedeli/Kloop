"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft, Package, Truck, Camera, Crown, X,
  CheckCircle2, XCircle, ChevronRight, LayoutDashboard,
  AlertTriangle, Mail
} from "lucide-react"
import { toast } from "sonner" // <-- Adicione no topo junto com os outros imports

// Tipagem exata dos dados que vem do Prisma
interface Address {
  label: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface Props {
  planSlug?: string
  hasActiveLot?: boolean
  address?: Address | null
}

const ADULT_ITEMS = [
  "roupas (conjuntos contam como uma peça)",
  "calçados",
  "bolsas",
  "óculos",
  "íntimos novos, com etiqueta",
  "chapéus e bonés",
  "cintos",
  "lenços e echarpes",
  "toucas e gorros",
]

const CHILDREN_ITEMS = [
  "roupas infantis (conjuntos contam como uma peça)",
  "calçados infantis",
  "bolsas e mochilas infantis",
  "chapéus e bonés infantis",
  "toucas e gorros",
  "cintos",
  "lenços e echarpes",
  "fantasias (bom estado)",
  "casacos e jaquetas",
  "macacões",
  "sapatinhos de bebê",
]

const NOT_ACCEPTED = [
  "peças íntimas usadas (sem etiqueta)",
  "chinelos e sandálias de borracha",
  "joias e semijoias",
  "cosméticos e perfumes",
  "eletrônicos e acessórios tech",
  "roupas de cama, banho ou mesa",
  "brinquedos",
  "réplicas ou itens falsificados",
  "uniformes escolares ou de trabalho",
  "fantasias em mau estado",
  "peças com identificação permanente",
]

const DEFECTIVE_CONDITIONS = [
  "bolinhas de tecido",
  "furadas",
  "rasgadas",
  "manchadas",
  "amareladas",
  "com mofo ou cheiro forte",
  "desbotadas",
  "descosturadas",
  "com zíper quebrado",
  "com botões faltando",
  "encolhidas ou deformadas",
]

const BRANDS = [
  "Schutz", "Arezzo", "Zara", "Levi's", "Nike", "Farm",
  "Adidas", "Ray-Ban", "Calvin Klein", "Lacoste", "Vans",
  "Gap", "Animale", "Tommy", "Osklen", "Le Lis Blanc",
]

export function ProLandingClient({ planSlug = "basic", hasActiveLot = false, address }: Props) {
  const router = useRouter()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isAcceptedItemsModalOpen, setIsAcceptedItemsModalOpen] = useState(false)
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [shippingView, setShippingView] = useState<"list" | "bag_confirm">("list")
  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false)
  
  const canSend = planSlug === "pro" || planSlug === "premium"

  function handleCTA() {
    if (!canSend) {
      setShowUpgrade(true)
      return
    }
    router.push("/pro/anuncio")
  }

  function handleConfirmBag() {
    setIsShippingModalOpen(false)
    setShippingView("list")
    toast.success("Sacola solicitada! Ela chegará no seu endereço em breve.")
  }

  function closeShippingModal() {
    setIsShippingModalOpen(false)
    setTimeout(() => setShippingView("list"), 300) 
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
            <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                    <Package size={18} className="text-[var(--color-teal)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-2 py-0.5 rounded-full">1</span>
                    <p className="text-[14px] font-black text-[var(--foreground)]">comece separando roupas e acessórios</p>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mb-2">
                    em uma única caixa, coloque 10 ou mais peças. vale roupas e acessórios adultos e infantis, em perfeito estado de conservação.
                  </p>
                  <button onClick={() => setIsAcceptedItemsModalOpen(true)} className="text-[11px] font-bold text-[var(--color-teal)] hover:underline flex items-center gap-1">
                    confira o que a gente aceita <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                    <Truck size={18} className="text-[var(--color-teal)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-2 py-0.5 rounded-full">2</span>
                    <p className="text-[14px] font-black text-[var(--foreground)]">embale suas peças e envie tudo pra cá</p>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mb-2">
                    você pode usar uma caixa qualquer ou pedir a sacola do kloop pro. depois, envie pelos correios (grátis) ou peça coleta em casa (R$ 20).
                  </p>
                  <button onClick={() => setIsShippingModalOpen(true)} className="text-[11px] font-bold text-[var(--color-teal)] hover:underline flex items-center gap-1">
                    confira como enviar suas peças <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center">
                    <Camera size={18} className="text-[var(--color-teal)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-2 py-0.5 rounded-full">3</span>
                    <p className="text-[14px] font-black text-[var(--foreground)]">fotografia, anúncio e venda é com a gente</p>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mb-2">
                    a gente fotografa bonito, coloca à venda, negocia e envia ao comprador. por esses serviços, temos uma comissão de 40% — 60% é sempre seu.
                  </p>
                  <button onClick={() => setIsFeesModalOpen(true)} className="text-[11px] font-bold text-[var(--color-teal)] hover:underline flex items-center gap-1">
                    entenda melhor nossas tarifas <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="px-4 pt-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-2">resumo</p>
          <h2 className="text-[20px] font-black text-[var(--foreground)] mb-5">o principal que você precisa saber</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] border border-transparent dark:border-white/5 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <CheckCircle2 size={18} className="text-[var(--color-teal)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-black text-white">60% de comissão pra você</p>
                <p className="text-[12px] text-white/70 leading-relaxed mt-0.5">pagamento mínimo garantido de R$ 3,00 por peça vendida. cobramos apenas uma taxa fixa por tempo de estoque.</p>
              </div>
            </div>
            <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] border border-transparent dark:border-white/5 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <Package size={18} className="text-[var(--color-teal)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-black text-white">só peças em perfeito estado</p>
                <p className="text-[12px] text-white/70 leading-relaxed mt-0.5">mínimo de 10 peças adultas ou infantis. enviou peça com defeito? ela é devolvida mediante tarifa.</p>
              </div>
            </div>
            <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] border border-transparent dark:border-white/5 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <Truck size={18} className="text-[var(--color-teal)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-black text-white">envio fácil e prático</p>
                <p className="text-[12px] text-white/70 leading-relaxed mt-0.5">envie grátis pelos correios ou peça nossa coleta na sua porta por R$ 20,00.</p>
              </div>
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

        {/* Só vi vantagens */}
        <div className="px-4 pt-10">
          <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-teal)]/5 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[22px] font-black text-white mb-2">só vi vantagens</p>
              <p className="text-[13px] text-white/60 mb-5 leading-relaxed">
                você separa, a gente faz o resto. simples, rápido e sem complicação.
              </p>
              <button
                onClick={handleCTA}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/30"
              >
                quero vender agora
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dúvidas */}
        <div className="px-4 pt-6 pb-4">
          <div className="text-center">
            <p className="text-[12px] text-gray-500 dark:text-sage mb-1">ainda tem dúvidas?</p>
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

      {/* Modal Upgrade */}
      {showUpgrade && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgrade(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-[var(--color-pine)] rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 pb-8">
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
              className="w-full py-4 bg-[var(--color-teal)] text-white rounded-2xl font-black text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-teal)]/20 text-center"
            >
              <Crown size={16} />
              ver planos de assinatura
            </Link>
          </div>
        </div>
      )}

      {/* Modal Itens Aceitos */}
      {isAcceptedItemsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAcceptedItemsModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-md mx-auto bg-white dark:bg-[var(--color-pine)] sm:rounded-3xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 shrink-0">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-1">itens aceitos</p>
                <h3 className="text-[18px] font-black text-[var(--foreground)] leading-tight">o que você pode enviar</h3>
              </div>
              <button 
                onClick={() => setIsAcceptedItemsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center self-start flex-shrink-0 ml-4"
              >
                <X size={16} className="text-[var(--foreground)]" />
              </button>
            </div>
            <div className="px-6 py-6 overflow-y-auto">
              <p className="text-[13px] text-gray-500 dark:text-sage mb-6 leading-relaxed">
                um time olha com carinho pra sua roupa, fotografa e anuncia. tudo pra garantir peças em bom estado e mais chances de vender.
              </p>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                  <p className="text-[12px] font-black uppercase tracking-wide text-green-600 dark:text-green-400">adultos (fem. e masc.)</p>
                </div>
                <div className="grid grid-cols-1 gap-y-2.5">
                  {ADULT_ITEMS.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] font-medium text-[var(--foreground)] leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                  <p className="text-[12px] font-black uppercase tracking-wide text-green-600 dark:text-green-400">roupas e acessórios infantis</p>
                </div>
                <div className="grid grid-cols-1 gap-y-2.5">
                  {CHILDREN_ITEMS.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] font-medium text-[var(--foreground)] leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 bg-red-500 rounded-full" />
                  <p className="text-[12px] font-black uppercase tracking-wide text-red-500">não aceitamos</p>
                </div>
                <div className="grid grid-cols-1 gap-y-2.5 bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                  {NOT_ACCEPTED.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[13px] font-medium text-red-900 dark:text-red-200 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5 mt-2">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] font-black text-amber-800 dark:text-amber-300 leading-tight">não enviamos peças com defeitos aparentes</p>
                </div>
                <p className="text-[13px] text-amber-700 dark:text-amber-400 mb-4 leading-relaxed font-medium">peças com qualquer uma das características abaixo serão devolvidas e podem gerar tarifa de retorno:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                  {DEFECTIVE_CONDITIONS.map((c) => (
                    <div key={c} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                      <p className="text-[12px] font-medium text-amber-800 dark:text-amber-300 leading-snug">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-6" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 shrink-0 sm:rounded-b-3xl">
              <button 
                onClick={() => { setIsAcceptedItemsModalOpen(false); handleCTA(); }}
                className="w-full py-4 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/20"
              >
                entendi, quero vender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Envio e Confirmação de Endereço */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeShippingModal} />
          
          <div className="relative z-10 w-full sm:max-w-md mx-auto bg-white dark:bg-[var(--color-pine)] sm:rounded-3xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-all">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 shrink-0">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-1">
                  {shippingView === "list" ? "envio" : "sacola kloop pro"}
                </p>
                <h3 className="text-[18px] font-black text-[var(--foreground)] leading-tight">
                  {shippingView === "list" ? "como enviar suas peças" : "confirmar endereço"}
                </h3>
              </div>
              <button 
                onClick={closeShippingModal} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center self-start flex-shrink-0 ml-4"
              >
                <X size={16} className="text-[var(--foreground)]" />
              </button>
            </div>

            {shippingView === "list" ? (
              <div className="px-6 py-6 overflow-y-auto space-y-3">
                <p className="text-[13px] text-gray-500 dark:text-sage mb-4 leading-relaxed">
                  escolha a opção que faz mais sentido pra você. todas chegam até o mesmo destino.
                </p>
                
                <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Package size={15} className="text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-[14px] font-black text-[var(--foreground)]">correios</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-black flex-shrink-0">gratuito</span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed">
                    imprima a etiqueta que a gente manda por e-mail e leve a caixa até qualquer agência dos correios. simples assim, sem custo pra você.
                  </p>
                </div>

                <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                        <Truck size={15} className="text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-[14px] font-black text-[var(--foreground)]">coleta em casa</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[11px] font-black flex-shrink-0">R$ 20,00</span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed">
                    não quer sair de casa? a gente manda um parceiro buscar a caixa no seu endereço. o valor de R$ 20 é debitado da sua primeira venda.
                  </p>
                </div>

                <button 
                  onClick={() => setShippingView("bag_confirm")}
                  className="w-full text-left bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[var(--color-celadon)]/20 flex items-center justify-center flex-shrink-0">
                        <Mail size={15} className="text-[var(--color-teal)]" />
                      </div>
                      <p className="text-[14px] font-black text-[var(--foreground)]">sacola kloop pro</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-[var(--foreground)] text-[11px] font-black flex-shrink-0">pedir agora</span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mb-3">
                    não tem caixa? peça a sacola kloop pro com antecedência. a gente envia pelo correio e você devolve com suas peças dentro.
                  </p>
                  <p className="text-[12px] font-bold text-[var(--color-teal)] group-hover:underline">
                    verificar endereço →
                  </p>
                </button>
                <div className="h-4" />
              </div>
            ) : (
              <div className="px-6 py-6 overflow-y-auto">
                <p className="text-[14px] font-bold text-[var(--foreground)] mb-5">
                  É para este endereço que enviaremos a sacola?
                </p>
                {address ? (
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 mb-8">
                    <p className="text-[14px] font-black text-[var(--foreground)] mb-1 uppercase tracking-wide">
                      {address.label || "Casa"}
                    </p>
                    <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}<br />
                      {address.neighborhood} - {address.city}/{address.state}<br />
                      CEP {address.zipCode}
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 mb-8">
                    <p className="text-[13px] font-bold text-red-800 dark:text-red-300">
                      Você ainda não tem um endereço cadastrado.
                    </p>
                    <Link href="/completar-perfil" className="text-[12px] text-red-600 dark:text-red-400 underline mt-1 block">
                      Cadastrar endereço agora
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <button 
                    disabled={!address}
                    onClick={handleConfirmBag}
                    className="w-full py-4 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-[var(--color-teal)]/20"
                  >
                    sim, confirmar pedido
                  </button>
                  <button 
                    onClick={() => setShippingView("list")}
                    className="w-full py-4 bg-transparent text-gray-500 dark:text-sage rounded-full font-bold text-[14px] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    voltar
                  </button>
                </div>
              </div>
            )}
            
            {shippingView === "list" && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 shrink-0 sm:rounded-b-3xl">
                <button 
                  onClick={() => { closeShippingModal(); handleCTA(); }}
                  className="w-full py-4 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/20"
                >
                  entendi, quero vender
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tarifas */}
      {isFeesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFeesModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-md mx-auto bg-white dark:bg-[var(--color-pine)] sm:rounded-3xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 shrink-0">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-teal)] mb-1">tarifas</p>
                <h3 className="text-[18px] font-black text-[var(--foreground)] leading-tight">entenda nossas tarifas</h3>
              </div>
              <button 
                onClick={() => setIsFeesModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center self-start flex-shrink-0 ml-4"
              >
                <X size={16} className="text-[var(--foreground)]" />
              </button>
            </div>
            <div className="px-6 py-6 overflow-y-auto">
              <p className="text-[13px] text-gray-500 dark:text-sage mb-6 leading-relaxed">
                transparência total pra você calcular o que vai ganhar.
              </p>
              <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-5 relative overflow-hidden mb-4 shadow-sm border border-transparent dark:border-white/5">
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-2">comissão por venda</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[40px] font-black text-white leading-none">60%</span>
                    <span className="text-[16px] font-black text-white/60">é seu</span>
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    por cada venda concluída, você fica com 60% do valor. a gente fica com 40% pelos serviços de fotografia, anúncio e logística.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden mb-4 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5">
                  <p className="text-[13px] font-black text-[var(--foreground)]">tarifa fixa de permanência</p>
                  <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5">cobrada por peça, por período em estoque</p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {[
                    { periodo: "até 90 dias", valor: "R$ 7,50" },
                    { periodo: "91 a 180 dias", valor: "R$ 10,00" },
                    { periodo: "181 a 360 dias", valor: "R$ 12,50" },
                    { periodo: "acima de 361 dias", valor: "R$ 50,00" },
                  ].map((row) => (
                    <div key={row.periodo} className="flex items-center justify-between px-5 py-3">
                      <p className="text-[13px] text-[var(--foreground)]">{row.periodo}</p>
                      <p className="text-[13px] font-black text-[var(--foreground)]">{row.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-start gap-3 shadow-sm">
                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-gray-600 dark:text-sage leading-relaxed">
                    <span className="font-bold text-[var(--foreground)]">pagamento mínimo garantido:</span> mesmo que sua peça venda por um valor baixo, você recebe no mínimo R$ 3,00 por item.
                  </p>
                </div>
                <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-start gap-3 shadow-sm">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-gray-600 dark:text-sage leading-relaxed">
                    <span className="font-bold text-[var(--foreground)]">peças não aceitas:</span> caso uma peça não seja aprovada na triagem, ela pode ser devolvida mediante tarifa de R$ 10,00 + frete.
                  </p>
                </div>
              </div>
              <div className="h-6" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 shrink-0 sm:rounded-b-3xl">
              <button 
                onClick={() => { setIsFeesModalOpen(false); handleCTA(); }}
                className="w-full py-4 bg-[var(--color-teal)] text-white rounded-full font-black text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-teal)]/20"
              >
                entendi, quero vender
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}