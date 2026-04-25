"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Camera, X, GripVertical, AlertCircle, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_BYTES = 5 * 1024 * 1024

type SlotStatus = "idle" | "uploading" | "done" | "error"

interface ImageSlot {
  id: string
  previewUrl?: string
  cloudinaryUrl?: string
  publicId?: string
  progress: number
  status: SlotStatus
  error?: string
}

export interface UploadedImage {
  url: string
  publicId: string
}

interface ImageUploaderProps {
  onChange: (images: UploadedImage[]) => void
  error?: string
}

function makeSlot(): ImageSlot {
  return { id: crypto.randomUUID(), progress: 0, status: "idle" }
}

function SortableSlot({
  slot,
  isCover,
  onFileSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  slot: ImageSlot
  isCover: boolean
  onFileSelect: (id: string, file: File) => void
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slot.id, disabled: slot.status !== "done" })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleSlotClick = () => {
    if (slot.status === "uploading") return
    if (slot.status === "done") return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(slot.id, file)
    e.target.value = ""
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-2xl border-2 border-dashed overflow-hidden transition-all bg-gray-50 dark:bg-white/5",
        isCover ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
        slot.status === "done"
          ? "border-transparent"
          : slot.status === "error"
            ? "border-red-400 cursor-pointer"
            : "border-gray-300 dark:border-white/20 hover:border-[var(--color-teal)] dark:hover:border-[var(--color-celadon)] cursor-pointer",
        isDragging && "opacity-50 z-50",
      )}
      onClick={slot.status === "done" ? undefined : handleSlotClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {slot.previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.previewUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {slot.status === "uploading" && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 p-3">
          <div className="w-4/5 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-150"
              style={{ width: `${slot.progress}%` }}
            />
          </div>
          <span className="text-white text-[11px] font-bold">{slot.progress}%</span>
        </div>
      )}

      {slot.status === "done" && (
        <>
          {isCover && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              capa
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(slot.id) }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 transition z-10"
            aria-label="Remover foto"
          >
            <X size={14} />
          </button>
          {/* Drag handle — visible on desktop */}
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 items-center justify-center hidden sm:flex cursor-grab active:cursor-grabbing z-10"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical size={14} />
          </div>
          {/* Move buttons — mobile fallback */}
          <div className="absolute bottom-2 right-2 flex flex-col gap-0.5 sm:hidden z-10">
            {canMoveUp && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMoveUp(slot.id) }}
                className="bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Mover para cima"
              >
                <ChevronUp size={12} />
              </button>
            )}
            {canMoveDown && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMoveDown(slot.id) }}
                className="bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Mover para baixo"
              >
                <ChevronDown size={12} />
              </button>
            )}
          </div>
        </>
      )}

      {slot.status === "idle" && (
        <div className="flex flex-col items-center justify-center h-full gap-1.5 text-gray-400 dark:text-sage">
          <Camera className={isCover ? "w-8 h-8" : "w-5 h-5"} strokeWidth={1.5} />
          {isCover && (
            <span className="text-[11px] font-bold tracking-wide uppercase">capa</span>
          )}
        </div>
      )}

      {slot.status === "error" && (
        <div
          className="flex flex-col items-center justify-center h-full gap-1 text-red-400 px-2 text-center"
          onClick={handleSlotClick}
        >
          <AlertCircle className={isCover ? "w-7 h-7" : "w-4 h-4"} />
          {slot.error && <p className="text-[10px] leading-tight">{slot.error}</p>}
          <span className="text-[10px] font-bold">Tentar de novo</span>
        </div>
      )}
    </div>
  )
}

export function ImageUploader({ onChange, error }: ImageUploaderProps) {
  const [slots, setSlots] = useState<ImageSlot[]>(() =>
    Array.from({ length: 6 }, makeSlot),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const completedImages = useMemo<UploadedImage[]>(
    () =>
      slots
        .filter((s) => s.status === "done" && s.cloudinaryUrl && s.publicId)
        .map((s) => ({ url: s.cloudinaryUrl!, publicId: s.publicId! })),
    [slots],
  )

  useEffect(() => {
    onChange(completedImages)
  }, [completedImages, onChange])

  const updateSlot = useCallback((id: string, patch: Partial<ImageSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const handleFileSelect = useCallback(
    async (id: string, file: File) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        updateSlot(id, { status: "error", error: "Tipo inválido. Use JPEG, PNG ou WebP.", previewUrl: undefined })
        return
      }
      if (file.size > MAX_BYTES) {
        updateSlot(id, { status: "error", error: "Arquivo muito grande. Máximo 5MB.", previewUrl: undefined })
        return
      }

      const previewUrl = URL.createObjectURL(file)
      updateSlot(id, { previewUrl, status: "uploading", progress: 0, error: undefined })

      const formData = new FormData()
      formData.append("file", file)

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/upload/image")

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setSlots((prev) =>
              prev.map((s) => (s.id === id ? { ...s, progress: pct } : s)),
            )
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText) as { url: string; publicId: string }
              updateSlot(id, { cloudinaryUrl: data.url, publicId: data.publicId, status: "done", progress: 100 })
            } catch {
              updateSlot(id, { status: "error", error: "Resposta inválida do servidor" })
            }
          } else {
            let errorMsg = "Erro no upload"
            try {
              const body = JSON.parse(xhr.responseText) as { error?: string }
              errorMsg = body.error ?? errorMsg
            } catch {
              // body não é JSON (ex: 500 HTML do Next.js)
            }
            updateSlot(id, { status: "error", error: errorMsg })
          }
          resolve()
        }

        xhr.onerror = () => {
          updateSlot(id, { status: "error", error: "Erro de conexão" })
          resolve()
        }

        xhr.send(formData)
      })
    },
    [updateSlot],
  )

  const handleRemove = useCallback((id: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl)
        return makeSlot()
      }),
    )
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSlots((prev) => {
      const from = prev.findIndex((s) => s.id === active.id)
      const to = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, from, to)
    })
  }, [])

  const handleMoveUp = useCallback((id: string) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      return idx > 0 ? arrayMove(prev, idx, idx - 1) : prev
    })
  }, [])

  const handleMoveDown = useCallback((id: string) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      return idx < prev.length - 1 ? arrayMove(prev, idx, idx + 1) : prev
    })
  }, [])

  return (
    <div>
      <p className="text-[13px] text-gray-500 dark:text-sage mb-4">
        Clique para selecionar fotos do seu dispositivo. A primeira será a capa do anúncio.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slots.map((s) => s.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-4 gap-3">
            {slots.map((slot, idx) => (
              <div
                key={slot.id}
                className={cn(idx === 0 ? "col-span-2 row-span-2" : "col-span-1")}
              >
                <SortableSlot
                  slot={slot}
                  isCover={idx === 0}
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={idx > 0 && slot.status === "done"}
                  canMoveDown={
                    idx < slots.length - 1 &&
                    slot.status === "done" &&
                    slots[idx + 1]?.status === "done"
                  }
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {error && (
        <p className="text-[12px] text-red-500 mt-2 pl-1 font-medium">{error}</p>
      )}
    </div>
  )
}
