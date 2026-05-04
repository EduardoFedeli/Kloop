"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Copy, FileText, X, Package, Truck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  code: string
  metodo: "correios" | "coleta"
  withBag?: boolean
}

export function ProSucessoClient({ code, metodo, withBag }: Props) {
  const [copied, setCopied] = useState(false)
  const [showDeclaracao, setShowDeclaracao] = useState(false)
  const isColeta = metodo === "coleta"

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-32">

        {/* Progress completo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-teal)]" />
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-teal)]" />
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-teal)]" />
        </div>

        {/* Header sucesso */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal)]/10 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-[var(--color-teal)]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[24px] font-black text-[var(--foreground)] mb-2">tudo certo!</h1>
          <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-xs mx-auto">
            {isColeta
              ? "Nossa equipe entrará em contato para agendar a coleta em até 2 dias úteis."
              : "Use o código abaixo para postar sua caixa em qualquer agência dos Correios."}
          </p>
        </div>

        {/* Código */}
        <div className="bg-[var(--color-pine)] dark:bg-[var(--color-forest)] rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[var(--color-teal)]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)] mb-2">
              {isColeta ? "código do lote" : "código de postagem"}
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[22px] font-black text-white tracking-widest">{code}</p>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all flex-shrink-0",
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Copy size={13} />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="space-y-3 mb-6">
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              {isColeta
                ? <Truck size={15} className="text-[var(--color-teal)]" />
                : <Package size={15} className="text-[var(--color-teal)]" />}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[var(--foreground)]">
                {isColeta ? "aguarde o contato" : "anote o código na caixa"}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5 leading-relaxed">
                {isColeta
                  ? "Nosso parceiro entrará em contato para confirmar o horário da coleta. Tenha a caixa pronta e lacrada."
                  : "Escreva o código na parte externa da caixa antes de levar à agência dos Correios."}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={15} className="text-[var(--color-teal)]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[var(--foreground)]">imprima a declaração de conteúdo</p>
              <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5 leading-relaxed">
                Coloque a declaração preenchida dentro da caixa. Se não puder imprimir, o atendente ou entregador fornecerá uma em branco para preenchimento no ato.
              </p>
            </div>
          </div>

          {withBag && (
            <div className="bg-[var(--color-celadon)]/10 border border-[var(--color-celadon)]/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-celadon)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package size={15} className="text-[var(--color-teal)]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--foreground)]">sacola a caminho!</p>
                <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5 leading-relaxed">
                  Sua sacola do Kloop Pro será enviada para o endereço cadastrado em até 5 dias úteis.
                </p>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/15 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Mínimo de 10 peças em perfeito estado de conservação. Peças não aceitas serão devolvidas ou doadas conforme sua preferência.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => setShowDeclaracao(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-gray-200 dark:border-white/10 text-[14px] font-bold text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Ver declaração de conteúdo
          </button>

          <Link
            href="/pro/dashboard"
            className="w-full py-4 bg-[var(--color-teal)] text-white rounded-2xl font-black text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-teal)]/20"
          >
            Ir para meu painel Kloop Pro
          </Link>
        </div>

      </div>

      {/* Modal: Declaração */}
      {showDeclaracao && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeclaracao(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[var(--color-pine)] rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
              <h3 className="text-[16px] font-black text-[var(--foreground)]">Declaração de conteúdo</h3>
              <button
                onClick={() => setShowDeclaracao(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"
              >
                <X size={16} className="text-[var(--foreground)]" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[18px] font-black text-[var(--foreground)]">kloop</p>
                    <p className="text-[11px] text-gray-400 dark:text-white/30">declaração de conteúdo kloop pro</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-teal)] text-white text-[11px] font-black">PRO</span>
                </div>

                <div className="space-y-5">
                  {[
                    { label: "nome completo:", value: "" },
                    { label: "e-mail cadastrado:", value: "" },
                    { label: "código do lote:", value: code },
                    { label: "quantidade de peças:", value: "" },
                    { label: "quantidade de volumes (caixas):", value: "" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] text-gray-400 dark:text-white/30 mb-1">{label}</p>
                      <div className="border-b border-gray-200 dark:border-white/10 pb-1 min-h-[24px]">
                        {value && <p className="text-[13px] font-bold text-[var(--foreground)]">{value}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-[10px] text-gray-400 dark:text-white/25 leading-relaxed">
                    Ao enviar este lote você confirma que todas as peças estão em perfeito estado de conservação e de acordo com as políticas do Kloop Pro. Peças não aceitas serão devolvidas ou doadas conforme sua preferência.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 dark:text-white/30 mt-4 text-center leading-relaxed">
                Se não puder imprimir, o atendente dos Correios ou o entregador fornecerá uma declaração em branco para preenchimento no momento do envio.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
