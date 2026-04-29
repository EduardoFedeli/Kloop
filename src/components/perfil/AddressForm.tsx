"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { addressSchema } from "@/lib/validators/address"
import type { ZodError } from "zod"

interface ViaCepResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface FieldErrors {
  zipCode?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  [key: string]: string | undefined
}

interface Props {
  redirectTo: string
}

export function AddressForm({ redirectTo }: Props) {
  const router = useRouter()

  const [zipCode, setZipCode] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")

  const [cepLoading, setCepLoading] = useState(false)
  const [cepFilled, setCepFilled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const numberRef = useRef<HTMLInputElement>(null)

  async function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "")
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits
    setZipCode(formatted)
    setCepFilled(false)
    setFieldErrors((prev) => ({ ...prev, zipCode: undefined }))

    if (digits.length !== 8) return

    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json() as ViaCepResponse

      if (!data.erro) {
        setStreet(data.logradouro ?? "")
        setNeighborhood(data.bairro ?? "")
        setCity(data.localidade ?? "")
        setState(data.uf ?? "")
        setCepFilled(true)
        numberRef.current?.focus()
      }
    } catch {
      // ViaCEP failed — user fills manually
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const result = addressSchema.safeParse({
      zipCode,
      street,
      number,
      complement: complement || undefined,
      neighborhood,
      city,
      state,
    })

    if (!result.success) {
      const errs: FieldErrors = {}
      ;(result.error as ZodError).issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (!errs[key]) errs[key] = issue.message
      })
      setFieldErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })

      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setServerError(json.error ?? "Erro ao salvar endereço")
        return
      }

      router.push(redirectTo)
    } catch {
      setServerError("Falha na conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (error?: string) =>
    cn(
      "w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition",
      "bg-white dark:bg-[var(--color-forest)] text-[var(--foreground)]",
      "placeholder:text-gray-400 dark:placeholder:text-sage",
      error
        ? "border-red-400 focus:border-red-400"
        : "border-gray-200 dark:border-white/10 focus:border-[var(--color-teal)]"
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* CEP */}
      <div>
        <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">CEP</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={zipCode}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className={cn(inputClass(fieldErrors.zipCode), "pr-10")}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {cepLoading && <Loader2 size={16} className="animate-spin text-[var(--color-teal)]" />}
            {!cepLoading && cepFilled && <CheckCircle2 size={16} className="text-[var(--color-teal)]" />}
          </span>
        </div>
        {fieldErrors.zipCode && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.zipCode}</p>}
        {!cepFilled && !cepLoading && zipCode.replace(/\D/g, "").length === 8 && (
          <p className="mt-1 text-[12px] text-gray-500 dark:text-sage">
            CEP não encontrado — preencha o endereço manualmente.
          </p>
        )}
      </div>

      {/* Logradouro */}
      <div>
        <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">Logradouro</label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Rua, Avenida, Travessa..."
          className={inputClass(fieldErrors.street)}
        />
        {fieldErrors.street && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.street}</p>}
      </div>

      {/* Número + Complemento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">Número</label>
          <input
            ref={numberRef}
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="123"
            className={inputClass(fieldErrors.number)}
          />
          {fieldErrors.number && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.number}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">
            Complemento{" "}
            <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apto 42, Bloco B"
            className={inputClass()}
          />
        </div>
      </div>

      {/* Bairro */}
      <div>
        <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">Bairro</label>
        <input
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Nome do bairro"
          className={inputClass(fieldErrors.neighborhood)}
        />
        {fieldErrors.neighborhood && (
          <p className="mt-1 text-[12px] text-red-500">{fieldErrors.neighborhood}</p>
        )}
      </div>

      {/* Cidade + Estado */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">Cidade</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo"
            className={inputClass(fieldErrors.city)}
          />
          {fieldErrors.city && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.city}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[var(--foreground)] mb-1.5">Estado</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="SP"
            maxLength={2}
            className={cn(inputClass(fieldErrors.state), "uppercase")}
          />
          {fieldErrors.state && <p className="mt-1 text-[12px] text-red-500">{fieldErrors.state}</p>}
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] text-red-600 dark:text-red-400">{serverError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full py-4 rounded-2xl text-[15px] font-black tracking-tight transition",
          "bg-[var(--color-pine)] dark:bg-[var(--color-teal)] text-white",
          "hover:opacity-90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2"
        )}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            salvando...
          </>
        ) : (
          <>
            <MapPin size={18} />
            salvar endereço
          </>
        )}
      </button>
    </form>
  )
}
