"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CategoryOption } from "@/types/listing"
import type { ListingActionResult } from "@/lib/actions/listing"
import type { ListingCondition } from "@prisma/client"

const conditionOptions: { value: ListingCondition; label: string }[] = [
  { value: "NEW", label: "Novo" },
  { value: "LIKE_NEW", label: "Seminovo" },
  { value: "GOOD", label: "Bom estado" },
  { value: "FAIR", label: "Usado" },
]

type InitialData = {
  title: string
  description: string
  priceCents: number
  categoryId: string
  condition: ListingCondition
  brand: string | null
  size: string | null
  imageUrls: string[]
}

type Props = {
  categories: CategoryOption[]
  action: (formData: FormData) => Promise<ListingActionResult>
  initialData?: InitialData
  submitLabel?: string
}

const fieldCls =
  "w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"

export function ListingForm({
  categories,
  action,
  initialData,
  submitLabel = "Publicar anúncio",
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.imageUrls.length ? initialData.imageUrls : [""]
  )

  const displayPrice = initialData
    ? (initialData.priceCents / 100).toFixed(2).replace(".", ",")
    : ""

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.delete("imageUrls")
    imageUrls.filter(Boolean).forEach((url) => formData.append("imageUrls", url))

    startTransition(async () => {
      const result = await action(formData)
      if (result.success) {
        toast.success(initialData ? "Anúncio atualizado!" : "Anúncio publicado!")
        if (result.slug) router.push(`/listing/${result.slug}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const addImageUrl = () => {
    if (imageUrls.length < 6) setImageUrls((prev) => [...prev, ""])
  }

  const removeImageUrl = (index: number) => {
    if (imageUrls.length === 1) return
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    setImageUrls((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    if (index === imageUrls.length - 1) return
    setImageUrls((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          type="text"
          defaultValue={initialData?.title ?? ""}
          required
          maxLength={100}
          className={fieldCls}
          placeholder="Ex: Calça jeans azul slim fit"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Descrição <span className="text-red-400">*</span>
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description ?? ""}
          required
          rows={4}
          maxLength={2000}
          className={cn(fieldCls, "resize-none")}
          placeholder="Descreva o produto: estado, medidas, marca, detalhes relevantes..."
        />
      </div>

      {/* Preço + Categoria */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">
            Preço (R$) <span className="text-red-400">*</span>
          </label>
          <input
            name="price"
            type="text"
            defaultValue={displayPrice}
            required
            className={fieldCls}
            placeholder="50,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">
            Categoria <span className="text-red-400">*</span>
          </label>
          <select
            name="categoryId"
            defaultValue={initialData?.categoryId ?? ""}
            required
            className={fieldCls}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Condição */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Condição <span className="text-red-400">*</span>
        </label>
        <select
          name="condition"
          defaultValue={initialData?.condition ?? ""}
          required
          className={fieldCls}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {conditionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Marca + Tamanho */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">Marca</label>
          <input
            name="brand"
            type="text"
            defaultValue={initialData?.brand ?? ""}
            maxLength={50}
            className={fieldCls}
            placeholder="Nike, Samsung..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">Tamanho</label>
          <input
            name="size"
            type="text"
            defaultValue={initialData?.size ?? ""}
            maxLength={20}
            className={fieldCls}
            placeholder="M, G, 42..."
          />
        </div>
      </div>

      {/* Fotos */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-2">
          Fotos (URLs) <span className="text-red-400">*</span>{" "}
          <span className="text-teal-muted font-normal">— {imageUrls.length}/6</span>
        </label>
        <div className="space-y-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className={cn(fieldCls, "flex-1")}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-2 text-teal-muted hover:text-airforce disabled:opacity-30 transition-colors"
                aria-label="Mover para cima"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === imageUrls.length - 1}
                className="p-2 text-teal-muted hover:text-airforce disabled:opacity-30 transition-colors"
                aria-label="Mover para baixo"
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => removeImageUrl(i)}
                disabled={imageUrls.length === 1}
                className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                aria-label="Remover foto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {imageUrls.length < 6 && (
          <button
            type="button"
            onClick={addImageUrl}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-teal hover:text-airforce transition-colors"
          >
            <PlusCircle size={16} />
            Adicionar foto
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 rounded-xl text-base font-bold text-white transition-colors",
          isPending ? "bg-gray-400 cursor-not-allowed" : "bg-airforce hover:bg-teal"
        )}
      >
        {isPending ? "Publicando..." : submitLabel}
      </button>
    </form>
  )
}
