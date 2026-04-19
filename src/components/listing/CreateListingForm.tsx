"use client"

import { useState, useTransition, useRef } from "react"
import { cn } from "@/lib/utils"
import { createListingAction } from "@/lib/actions/listing"
import type { ListingActionResult } from "@/lib/actions/listing"
import categoriesData from "../../../categories-data.json"
import { Check, Camera, X, Package } from "lucide-react"

type CategoriesJson = Record<string, Record<string, Record<string, string[]>>>
const data = categoriesData as CategoriesJson
const DEPARTMENTS = Object.keys(data)

const BRANDS = [
  "Adidas", "Animale", "Arezzo", "Armani Exchange", "Balenciaga", "Balmain",
  "Burberry", "Calvin Klein", "Cantão", "Chanel", "Colcci", "Diesel", "Dior",
  "Dolce & Gabbana", "Dudalina", "Ellus", "Farm", "Fendi", "Forum",
  "Givenchy", "Gucci", "Guess", "H&M", "Hering", "Hugo Boss",
  "Isabela Capeto", "Iódice", "Jacquemus", "John John", "Lacoste",
  "Le Lis Blanc", "Levi's", "Louis Vuitton", "Mango", "Marc Jacobs",
  "Maria Filó", "Melissa", "Michael Kors", "Missoni", "Moschino",
  "Nike", "Off-White", "Osklen", "Polo Ralph Lauren", "Prada", "Puma",
  "Riachuelo", "Sacada", "Saint Laurent", "Schutz", "Shoulder",
  "Tommy Hilfiger", "Track & Field", "Triton", "Valentino", "Versace",
  "Vix", "Vivara", "Vizzano", "Zara", "Zoomp",
].sort()

const CONDITIONS = [
  { value: "NEW", label: "Novo", desc: "Com etiqueta, nunca usado" },
  { value: "LIKE_NEW", label: "Seminovo", desc: "Usado poucas vezes, sem defeitos" },
  { value: "GOOD", label: "Bom estado", desc: "Pequenos sinais de uso" },
  { value: "FAIR", label: "Usado", desc: "Sinais de uso visíveis" },
]

const WEIGHTS = [
  "0,3 kg", "0,5 kg", "1,0 kg", "2,0 kg",
  "3,0 kg", "4,0 kg", "5,0 kg", "6,0 kg", "Acima de 6 kg",
]

const DELIVERY_TYPES = ["Transportadora", "Entrega em mãos"]

// ─── Size logic ───────────────────────────────────────────────────────────────

type SizeContext =
  | { show: false }
  | { show: true; label: string; options: string[] }

const ADULT_CLOTHING = ["PP", "P", "M", "G", "GG", "XG", "XGG", "Único"]
const ADULT_SHOES = Array.from({ length: 14 }, (_, i) => String(33 + i))
const KIDS_CLOTHING = [
  "RN", "0–3m", "3–6m", "6–9m", "9–12m",
  "1 ano", "2 anos", "4 anos", "6 anos", "8 anos", "10 anos", "12 anos", "14 anos",
]
const KIDS_SHOES = Array.from({ length: 22 }, (_, i) => String(14 + i))

function getSizeContext(department: string, category: string): SizeContext {
  if (department === "moças" || department === "rapazes") {
    if (category === "roupas") return { show: true, label: "Tamanho", options: ADULT_CLOTHING }
    if (category === "calçados") return { show: true, label: "Número", options: ADULT_SHOES }
    if (category === "lingerie e moda praia" || category === "moda íntima") {
      return { show: true, label: "Tamanho", options: ADULT_CLOTHING }
    }
  }
  if (department === "crianças") {
    if (category === "roupas") return { show: true, label: "Tamanho", options: KIDS_CLOTHING }
    if (category === "calçados") return { show: true, label: "Número", options: KIDS_SHOES }
  }
  return { show: false }
}

// ─── Price helpers ────────────────────────────────────────────────────────────

const COMMISSION_RATE = 0.18
const FIXED_FEE = 7.5

function parsePriceFloat(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, "").replace(",", ".")) || 0
}

function fmtBRL(val: number): string {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  photos: string[]
  title: string
  description: string
  brand: string
  noBrand: boolean
  condition: string
  department: string
  category: string
  subcategory: string
  characteristic: string
  price: string
  acceptsOffers: boolean
  smartPrice: boolean
  mode: "classico" | "turbinado"
  weight: string
  delivery: string
  size: string
  quantity: number
}

const INITIAL: FormState = {
  photos: ["", "", "", "", ""],
  title: "",
  description: "",
  brand: "",
  noBrand: false,
  condition: "",
  department: "",
  category: "",
  subcategory: "",
  characteristic: "",
  price: "",
  acceptsOffers: false,
  smartPrice: false,
  mode: "classico",
  weight: "",
  delivery: "",
  size: "",
  quantity: 1,
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function SectionCard({ title, action, children }: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-[var(--foreground)]">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

function SelectField({
  placeholder, value, options, onChange, required,
}: {
  placeholder: string; value: string; options: string[]
  onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(
          "w-full bg-transparent border rounded-xl px-4 py-3.5 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--color-teal)] transition-colors appearance-none cursor-pointer",
          required && !value ? "border-gray-200 dark:border-white/20 text-gray-400 dark:text-sage" : "border-gray-200 dark:border-white/20",
        )}
      >
        <option value="" disabled className="bg-white dark:bg-[var(--color-pine)] text-gray-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-white dark:bg-[var(--color-pine)] text-[var(--foreground)]">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-sage">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[14px] font-bold text-[var(--foreground)]">{label}</span>
        <div className={cn(
          "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
          checked ? "bg-[var(--color-pine)] dark:bg-[var(--color-celadon)]" : "bg-gray-200 dark:bg-white/10",
        )}>
          <div className={cn(
            "absolute top-1 w-5 h-5 bg-white dark:bg-[var(--color-forest)] rounded-full shadow transition-all",
            checked ? "left-6" : "left-1",
          )} />
        </div>
      </button>
      {desc && checked && (
        <p className="text-[13px] text-gray-500 dark:text-sage mt-2 leading-relaxed pr-8">{desc}</p>
      )}
    </div>
  )
}

// ─── Photo slot ───────────────────────────────────────────────────────────────

function PhotoSlot({ url, idx, isMain, onChange }: {
  url: string; idx: number; isMain: boolean; onChange: (i: number, u: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const size = isMain ? "w-full aspect-square sm:w-40 sm:h-40" : "w-full aspect-square sm:w-24 sm:h-24"

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className={cn(
          size,
          "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group bg-gray-50 dark:bg-white/5",
          url ? "border-transparent" : "border-gray-300 dark:border-white/20 hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)]",
        )}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(idx, "") }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 transition"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-sage group-hover:text-[var(--color-teal)] dark:group-hover:text-[var(--color-celadon)] transition-colors">
            <Camera className={cn(isMain ? "w-8 h-8" : "w-5 h-5")} strokeWidth={1.5} />
            {isMain && <span className="text-[11px] font-bold tracking-wide uppercase">capa</span>}
          </div>
        )}
      </div>
      {editing && (
        <input
          ref={inputRef}
          type="text"
          className="text-[12px] border border-gray-200 dark:border-white/20 bg-transparent text-[var(--foreground)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-teal)]"
          placeholder="Cole a URL da foto"
          value={url}
          onChange={(e) => onChange(idx, e.target.value)}
          onBlur={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function PhotoSlots({ photos, onChange }: { photos: string[]; onChange: (i: number, u: string) => void }) {
  return (
    <SectionCard title="Fotos *">
      <p className="text-[13px] text-gray-500 dark:text-sage mb-4 -mt-2">
        Clique nos espaços para colar a URL da imagem. A primeira será a capa do anúncio.
      </p>
      <div className="grid grid-cols-4 gap-3 sm:flex sm:flex-wrap">
        <div className="col-span-2 row-span-2 sm:col-span-1 sm:row-span-1">
          <PhotoSlot url={photos[0]} idx={0} isMain={true} onChange={onChange} />
        </div>
        {photos.slice(1).map((url, idx) => (
          <div key={idx + 1} className="col-span-1">
            <PhotoSlot url={url} idx={idx + 1} isMain={false} onChange={onChange} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Brand autocomplete ───────────────────────────────────────────────────────

function BrandInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const filtered = value.length > 0
    ? BRANDS.filter((b) => b.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
    : []

  return (
    <div className="relative">
      <input
        type="text"
        disabled={disabled}
        placeholder={disabled ? "Sem marca" : "Ex: Nike, Zara, Farm..."}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cn(
          "w-full bg-transparent border rounded-xl px-4 py-3.5 text-[14px] outline-none transition-colors",
          disabled
            ? "bg-gray-50 dark:bg-white/5 text-gray-400 cursor-not-allowed border-gray-200 dark:border-white/10"
            : "border-gray-200 dark:border-white/20 focus:border-[var(--color-teal)] text-[var(--foreground)]",
        )}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/20 rounded-xl mt-2 shadow-xl max-h-48 overflow-y-auto overflow-hidden">
          {filtered.map((brand) => (
            <li
              key={brand}
              onMouseDown={() => { onChange(brand); setOpen(false) }}
              className="px-4 py-3 text-[14px] text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
            >
              {brand}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Condition cards ──────────────────────────────────────────────────────────

function ConditionCards({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SectionCard title="Condição *">
      <div className="grid grid-cols-2 gap-3">
        {CONDITIONS.map((c) => {
          const isSelected = value === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden",
                isSelected
                  ? "border-[var(--color-pine)] dark:border-[var(--color-celadon)] bg-[var(--color-teal)]/5 dark:bg-white/5"
                  : "border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20",
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-[var(--color-pine)] dark:text-[var(--color-celadon)]">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
              <p className={cn("text-[14px] font-bold mb-1", isSelected ? "text-[var(--color-pine)] dark:text-[var(--color-celadon)]" : "text-[var(--foreground)]")}>
                {c.label}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-sage pr-4 leading-relaxed">{c.desc}</p>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Category cascade ─────────────────────────────────────────────────────────

function CategoryCascade({ department, category, subcategory, characteristic, onChange }: {
  department: string; category: string; subcategory: string; characteristic: string
  onChange: (key: keyof FormState, value: string) => void
}) {
  const categories = department ? Object.keys(data[department] ?? {}) : []
  const subcategories =
    department && category ? Object.keys(data[department]?.[category] ?? {}) : []
  const characteristics =
    department && category && subcategory
      ? (data[department]?.[category]?.[subcategory] ?? [])
      : []

  const hasCharacteristics = characteristics.length > 0

  return (
    <SectionCard title="Categoria *">
      <div className="space-y-3">
        <SelectField
          placeholder="Selecione o departamento"
          value={department}
          options={DEPARTMENTS}
          onChange={(v) => onChange("department", v)}
        />
        {department && (
          <SelectField
            placeholder="Selecione a categoria"
            value={category}
            options={categories}
            onChange={(v) => onChange("category", v)}
          />
        )}
        {category && subcategories.length > 0 && (
          <SelectField
            placeholder="Selecione a subcategoria"
            value={subcategory}
            options={subcategories}
            onChange={(v) => onChange("subcategory", v)}
          />
        )}
        {subcategory && hasCharacteristics && (
          <div>
            <SelectField
              placeholder="Selecione a característica *"
              value={characteristic}
              options={characteristics}
              onChange={(v) => onChange("characteristic", v)}
              required
            />
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Size + quantity ──────────────────────────────────────────────────────────

function SizeQuantitySection({ sizeCtx, size, quantity, onSizeChange, onQuantityChange }: {
  sizeCtx: SizeContext
  size: string
  quantity: number
  onSizeChange: (v: string) => void
  onQuantityChange: (v: number) => void
}) {
  return (
    <SectionCard title="Tamanho e quantidade">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-2 font-medium">
            {sizeCtx.show ? sizeCtx.label : "Tamanho"}
          </p>
          {sizeCtx.show ? (
            <SelectField
              placeholder="Selecione"
              value={size}
              options={sizeCtx.options}
              onChange={onSizeChange}
            />
          ) : (
            <div className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-[14px] bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-sage/50 cursor-not-allowed select-none">
              Não aplicável
            </div>
          )}
        </div>
        <div>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-2 font-medium">Quantidade</p>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3.5 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--color-teal)]"
          />
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Valor a receber modal ────────────────────────────────────────────────────

function ValorAReceberModal({ price, onClose }: { price: string; onClose: () => void }) {
  const priceNum = parsePriceFloat(price)
  const commission = priceNum * COMMISSION_RATE
  const received = Math.max(0, priceNum - commission - FIXED_FEE)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[var(--color-forest)] rounded-3xl w-full sm:max-w-sm p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <p className="font-black text-[var(--foreground)] text-[18px]">valor a receber</p>
          <p className="text-[13px] text-gray-500 dark:text-sage mt-1">Transparência nas taxas do seu plano</p>
        </div>

        <div className="space-y-3 text-[14px]">
          <div className="flex justify-between text-[var(--foreground)]">
            <span>valor do produto</span>
            <span className="font-bold">R$ {fmtBRL(priceNum)}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-sage">
            <span>comissão ({Math.round(COMMISSION_RATE * 100)}%)</span>
            <span className="text-red-500 font-medium">- R$ {fmtBRL(commission)}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-sage">
            <span>tarifa fixa</span>
            <span className="text-red-500 font-medium">- R$ {fmtBRL(FIXED_FEE)}</span>
          </div>
          
          <hr className="border-gray-200 dark:border-white/10 my-4" />
          
          <div className="flex justify-between font-black text-[var(--color-pine)] dark:text-[var(--color-celadon)] text-[16px]">
            <span>receba até</span>
            <span>R$ {fmtBRL(received)}</span>
          </div>
        </div>

        <p className="text-[12px] text-gray-400 dark:text-sage/70 text-center leading-relaxed px-4">
          o valor a receber pode mudar caso você faça negociações, aceite ofertas ou ofereça descontos.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full border-2 border-[var(--color-pine)] dark:border-[var(--color-celadon)] text-[var(--color-pine)] dark:text-[var(--color-celadon)] font-bold py-3.5 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[14px]"
        >
          ok, entendi
        </button>
      </div>
    </div>
  )
}

// ─── Mode cards ───────────────────────────────────────────────────────────────

function ModeCards({ value, onChange }: {
  value: string; onChange: (v: "classico" | "turbinado") => void
}) {
  const modes = [
    { key: "classico" as const, label: "Clássico", desc: "Anúncio padrão gratuito", icon: "☁️" },
    { key: "turbinado" as const, label: "Turbinado", desc: "Mais destaque e visibilidade", icon: "⚡", badge: "Em breve" },
  ]

  return (
    <SectionCard title="Modo do anúncio">
      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => {
          const isSelected = value === m.key;
          return (
            <button
              key={m.key}
              type="button"
              disabled={m.key === "turbinado"}
              onClick={() => m.key === "classico" && onChange(m.key)}
              className={cn(
                "relative text-left p-4 rounded-xl border-2 transition-all",
                isSelected ? "border-[var(--color-pine)] dark:border-[var(--color-celadon)] bg-[var(--color-teal)]/5 dark:bg-white/5" : "border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20",
                m.key === "turbinado" && "opacity-60 cursor-not-allowed",
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-[var(--color-pine)] dark:text-[var(--color-celadon)]">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
              <span className="text-2xl mb-2 block">{m.icon}</span>
              <p className={cn("text-[14px] font-bold mb-1", isSelected ? "text-[var(--color-pine)] dark:text-[var(--color-celadon)]" : "text-[var(--foreground)]")}>
                {m.label}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-sage leading-tight">{m.desc}</p>
              {m.badge && (
                <span className="absolute top-3 right-3 text-[10px] bg-[var(--color-teal)] text-white font-bold px-2 py-0.5 rounded-full">
                  {m.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] text-[14px] font-bold px-6 py-3.5 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-300 whitespace-nowrap">
      {message}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface CreateListingFormProps {
  activeCount: number
  maxListings: number
  planName: string
}

export function CreateListingForm({ activeCount, maxListings, planName }: CreateListingFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [toast, setToast] = useState("")
  const [form, setForm] = useState<FormState>(INITIAL)
  const [result, setResult] = useState<ListingActionResult | null>(null)
  const [showValorModal, setShowValorModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const hasReachedLimit = maxListings !== -1 && activeCount >= maxListings

  // Derived state
  const sizeCtx = getSizeContext(form.department, form.category)
  const availableCharacteristics =
    form.department && form.category && form.subcategory
      ? (data[form.department]?.[form.category]?.[form.subcategory] ?? [])
      : []

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3500)
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      if (key === "department") {
        return { ...prev, department: value as string, category: "", subcategory: "", characteristic: "", size: "" }
      }
      if (key === "category") {
        return { ...prev, category: value as string, subcategory: "", characteristic: "", size: "" }
      }
      if (key === "subcategory") {
        return { ...prev, subcategory: value as string, characteristic: "" }
      }
      return { ...prev, [key]: value }
    })
  }

  function handlePhotoChange(idx: number, url: string) {
    const photos = [...form.photos]
    photos[idx] = url
    setForm((prev) => ({ ...prev, photos }))
  }

  function handlePriceInput(raw: string) {
    const digits = raw.replace(/\D/g, "")
    if (!digits) { set("price", ""); return }
    const reais = (parseInt(digits, 10) / 100).toFixed(2).replace(".", ",")
    set("price", reais)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const filledPhotos = form.photos.filter(Boolean)
    if (filledPhotos.length === 0) { showToast("Adicione pelo menos 1 foto da peça"); return }
    if (!form.condition) { showToast("Selecione a condição do produto"); return }
    if (!form.department) { showToast("Selecione o departamento"); return }
    if (availableCharacteristics.length > 0 && !form.characteristic) {
      showToast("Selecione a característica do produto"); return
    }

    const fd = new FormData()
    fd.set("title", form.title)
    fd.set("description", form.description)
    fd.set("price", form.price)
    fd.set("condition", form.condition)
    fd.set("brand", form.noBrand ? "" : form.brand)
    fd.set("department", form.department)
    fd.set("category", form.category)
    fd.set("subcategory", form.subcategory)
    fd.set("characteristic", form.characteristic)
    fd.set("weight", form.weight)
    fd.set("delivery", form.delivery)
    fd.set("acceptsOffers", String(form.acceptsOffers))
    fd.set("size", sizeCtx.show ? form.size : "")
    fd.set("quantity", String(form.quantity))
    filledPhotos.forEach((url) => fd.append("imageUrls", url))

    startTransition(async () => {
      const res = await createListingAction(fd)
      setResult(res)
      if (res.success) showToast("Sucesso! O produto está no ar 🎉")
    })
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (result?.success) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-[var(--color-pine)] rounded-3xl p-10 text-center space-y-6 border border-gray-100 dark:border-white/5 shadow-xl mt-4">
        <div className="w-20 h-20 bg-[var(--color-teal)]/10 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-[var(--color-teal)] dark:text-[var(--color-celadon)]" strokeWidth={3} />
        </div>
        <div>
          <p className="font-black text-[var(--foreground)] text-[22px]">Anúncio publicado!</p>
          <p className="text-[14px] text-gray-500 dark:text-sage mt-2">Sua peça já está disponível no feed para milhões de compradores.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {result.slug && (
            <a
              href={`/listing/${result.slug}`}
              className="px-8 py-3.5 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] font-bold text-[15px] rounded-full hover:opacity-90 transition-opacity"
            >
              Ver meu anúncio
            </a>
          )}
          <button
            onClick={() => { setForm(INITIAL); setResult(null); setStep(1) }}
            className="px-8 py-3.5 border-2 border-[var(--color-pine)] dark:border-white/20 text-[var(--color-pine)] dark:text-white font-bold text-[15px] rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Vender mais um
          </button>
        </div>
      </div>
    )
  }

  // ── Step 1: Choose mode ───────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto space-y-4 mt-2">
        <Toast message={toast} />

        <button
          type="button"
          onClick={() => {
            if (hasReachedLimit) { showToast(`Você atingiu o limite de ${maxListings} anúncios do plano ${planName}.`); return }
            setStep(2)
          }}
          className="w-full bg-white dark:bg-[var(--color-pine)] border-2 border-transparent hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)] rounded-3xl p-6 text-left transition-all shadow-sm group"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal)]/10 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-teal)]/20 transition-colors">
              <Camera className="w-7 h-7 text-[var(--color-teal)] dark:text-[var(--color-celadon)]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-black text-[var(--foreground)] text-[18px]">criar anúncio</p>
              <p className="text-[14px] text-gray-500 dark:text-sage mt-1">Desapegue de um produto do seu armário</p>
              {maxListings !== -1 && (
                <p className="text-[12px] text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-bold mt-2">
                  {activeCount} de {maxListings} anúncios ativos no plano {planName}
                </p>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => showToast("Em breve! Fique de olho nas novidades 👀")}
          className="w-full bg-white dark:bg-[var(--color-pine)] border-2 border-transparent rounded-3xl p-6 text-left shadow-sm opacity-60 cursor-not-allowed"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-gray-400 dark:text-sage" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-[var(--foreground)] text-[18px]">kloop pro</p>
                <span className="text-[10px] bg-[var(--color-teal)] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Breve</span>
              </div>
              <p className="text-[14px] text-gray-500 dark:text-sage mt-1">Envie uma sacola e a gente vende por você</p>
            </div>
          </div>
        </button>
      </div>
    )
  }

  // ── Step 2: Full form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12 mt-2">
      <Toast message={toast} />

      {showValorModal && (
        <ValorAReceberModal price={form.price} onClose={() => setShowValorModal(false)} />
      )}

      <div className="flex items-center gap-4 mb-2 pl-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[var(--color-pine)] shadow-sm text-[var(--foreground)] hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-black text-[var(--foreground)] text-[20px]">detalhes do produto</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Photos */}
        <PhotoSlots photos={form.photos} onChange={handlePhotoChange} />

        {/* Title */}
        <SectionCard title="Título *">
          <div className="relative">
            <input
              type="text"
              required
              maxLength={45}
              placeholder="Ex: Jaqueta jeans vintage azul escuro..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3.5 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--color-teal)] pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 dark:text-sage font-medium">
              {form.title.length}/45
            </span>
          </div>
        </SectionCard>

        {/* Description */}
        <SectionCard title="Descrição *">
          <div className="relative">
            <textarea
              required
              rows={5}
              minLength={15}
              maxLength={600}
              placeholder="Conte todos os detalhes da peça. Qual é o tecido? Tem alguma avaria? Como fica no corpo?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full bg-transparent border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3.5 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--color-teal)] resize-none"
            />
            <span className="absolute right-4 bottom-4 text-[12px] text-gray-400 dark:text-sage font-medium bg-white dark:bg-[var(--color-pine)] px-1">
              {form.description.length}/600
            </span>
          </div>
          {form.description.length > 0 && form.description.length < 15 && (
            <p className="text-[12px] text-red-500 mt-1 pl-1 font-medium">
              Faltam {15 - form.description.length} caracteres para uma boa descrição.
            </p>
          )}
        </SectionCard>

        {/* Brand */}
        <SectionCard title="Marca">
          <BrandInput value={form.brand} onChange={(v) => set("brand", v)} disabled={form.noBrand} />
          <label className="flex items-center gap-3 mt-3 cursor-pointer p-1">
            <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", form.noBrand ? "bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] border-transparent" : "border-gray-300 dark:border-white/30")}>
              {form.noBrand && <Check size={14} className="text-white dark:text-[var(--color-pine)]" strokeWidth={3} />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={form.noBrand}
              onChange={(e) => { set("noBrand", e.target.checked); if (e.target.checked) set("brand", "") }}
            />
            <span className="text-[14px] text-gray-600 dark:text-sage select-none">Esta peça não possui marca</span>
          </label>
        </SectionCard>

        {/* Condition */}
        <ConditionCards value={form.condition} onChange={(v) => set("condition", v)} />

        {/* Category cascade */}
        <CategoryCascade
          department={form.department}
          category={form.category}
          subcategory={form.subcategory}
          characteristic={form.characteristic}
          onChange={(key, value) => set(key, value as string)}
        />

        {/* Size + quantity */}
        <SizeQuantitySection
          sizeCtx={sizeCtx}
          size={form.size}
          quantity={form.quantity}
          onSizeChange={(v) => set("size", v)}
          onQuantityChange={(v) => set("quantity", v)}
        />

        {/* Price */}
        <SectionCard
          title="Preço *"
          action={
            <button
              type="button"
              onClick={() => setShowValorModal(true)}
              className="text-[12px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] hover:underline underline-offset-2"
            >
              entenda suas taxas
            </button>
          }
        >
          <div className="flex items-center border border-gray-200 dark:border-white/20 rounded-xl overflow-hidden focus-within:border-[var(--color-teal)] transition-colors">
            <span className="px-4 py-3.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-sage font-bold text-[14px] border-r border-gray-200 dark:border-white/10 select-none">
              R$
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0,00"
              value={form.price}
              onChange={(e) => handlePriceInput(e.target.value)}
              className="flex-1 px-4 py-3.5 text-[16px] outline-none font-black text-[var(--foreground)] bg-transparent"
            />
          </div>
          
          <hr className="border-gray-100 dark:border-white/5 my-2" />
          
          <div className="space-y-4 pt-2">
            <Toggle
              label="Topa negociar?"
              desc="Compradores poderão fazer ofertas abaixo do valor estipulado."
              checked={form.acceptsOffers}
              onChange={(v) => set("acceptsOffers", v)}
            />
            <Toggle
              label="Preço esperto"
              desc="Ativamos descontos progressivos automáticos se a peça demorar a vender."
              checked={form.smartPrice}
              onChange={(v) => set("smartPrice", v)}
            />
          </div>
        </SectionCard>

        {/* Mode */}
        <ModeCards value={form.mode} onChange={(v) => set("mode", v)} />

        {/* Delivery */}
        <SectionCard title="Envio">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] text-gray-500 dark:text-sage mb-2 font-medium">Peso estimado</p>
              <SelectField
                placeholder="Selecione o peso"
                value={form.weight}
                options={WEIGHTS}
                onChange={(v) => set("weight", v)}
              />
            </div>
            <div>
              <p className="text-[13px] text-gray-500 dark:text-sage mb-2 font-medium">Método principal</p>
              <SelectField
                placeholder="Como vai entregar?"
                value={form.delivery}
                options={DELIVERY_TYPES}
                onChange={(v) => set("delivery", v)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Server error */}
        {result && !result.success && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-5 py-4 text-[14px] font-medium text-red-600 dark:text-red-400">
            {result.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] font-black py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-[16px] mt-4 shadow-lg shadow-[var(--color-pine)]/20"
        >
          {isPending ? "Publicando seu anúncio..." : "Publicar anúncio"}
        </button>
      </form>
    </div>
  )
}