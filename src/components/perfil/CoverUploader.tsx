"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Camera, X, Upload, AlertCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  currentCoverUrl?: string | null
}

type UploadState = "idle" | "uploading" | "error"

const PREMADE_COVERS = [
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000", // Natureza
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000", // Abstrato Verde
  "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?q=80&w=1000", // Textura Minimalista
]

export function CoverUploader({ currentCoverUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function openDrawer() {
    setIsOpen(true)
    setPreview(null)
    setUploadedUrl(null)
    setUploadedPublicId(null)
    setProgress(0)
    setUploadState("idle")
    setError(null)
  }

  function closeDrawer() {
    // Só revoga objeto URL se for um arquivo local (blob)
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setIsOpen(false)
  }

  function handlePremadeSelect(url: string) {
    setError(null)
    setPreview(url)
    setUploadedUrl(url)
    setUploadedPublicId("premade_cover") // ID fake genérico pra passar na validação de save
    setUploadState("idle")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])
    if (!ALLOWED.has(file.type)) {
      setError("Use JPEG, PNG ou WebP.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB.")
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploadState("uploading")
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/upload/image")

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string; publicId: string }
          setUploadedUrl(data.url)
          setUploadedPublicId(data.publicId)
          setUploadState("idle")
          setProgress(100)
        } catch {
          setUploadState("error")
          setError("Resposta inválida do servidor.")
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string }
          setError(body.error ?? "Erro no upload.")
        } catch {
          setError("Erro no upload.")
        }
        setUploadState("error")
      }
    }

    xhr.onerror = () => {
      setUploadState("error")
      setError("Erro de conexão.")
    }

    xhr.send(formData)
  }

  function handleSave() {
    if (!uploadedUrl || !uploadedPublicId) return
    startTransition(async () => {
      const res = await fetch("/api/users/cover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadedUrl, publicId: uploadedPublicId }),
      })
      if (res.ok) {
        closeDrawer()
        router.refresh()
      } else {
        setError("Falha ao salvar. Tente novamente.")
      }
    })
  }

  const canSave = uploadedUrl && uploadedPublicId && uploadState === "idle" && !isPending

  return (
    <>
      {/* Banner clicável */}
      <button
        type="button"
        onClick={openDrawer}
        className="group absolute inset-0 w-full h-full flex items-center justify-center"
        aria-label={currentCoverUrl ? "Trocar foto de capa" : "Adicionar foto de capa"}
      >
        {currentCoverUrl ? (
          <>
            <Image
              src={currentCoverUrl}
              alt="Capa do perfil"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/60 text-white text-[13px] font-bold px-4 py-2 rounded-full">
                <Camera size={16} /> trocar capa
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-sage/50">
            <Camera size={24} className="mb-1 opacity-50" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">adicionar capa</span>
          </div>
        )}
      </button>

      {/* Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--color-pine)] w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <button onClick={closeDrawer} className="text-[var(--foreground)]" aria-label="Fechar">
                <X size={22} />
              </button>
              <h2 className="text-[16px] font-black text-[var(--foreground)]">foto de capa</h2>
              <div className="w-6" />
            </div>

            {/* Preview */}
            <div className="px-6 pt-6">
              <div
                className={cn(
                  "relative w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border-2 border-dashed",
                  uploadState === "error"
                    ? "border-red-400"
                    : "border-gray-300 dark:border-white/20",
                )}
                style={{ aspectRatio: "4 / 1" }}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-sage/50 gap-2">
                    <Upload size={28} strokeWidth={1.5} />
                    <p className="text-[13px] font-medium">selecione uma imagem</p>
                    <p className="text-[11px]">proporção 4:1 · máx. 5MB · JPEG, PNG ou WebP</p>
                  </div>
                )}

                {/* Progress overlay */}
                {uploadState === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-6">
                    <div className="w-4/5 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-white text-[12px] font-bold">{progress}%</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-[12px] font-medium">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            {/* Capas Pré-Prontas */}
            <div className="px-6 mt-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={14} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">ou escolha uma capa pronta</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {PREMADE_COVERS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePremadeSelect(url)}
                    className={cn(
                      "relative w-[120px] h-[40px] rounded-lg overflow-hidden shrink-0 snap-start border-2",
                      uploadedUrl === url ? "border-[var(--color-teal)]" : "border-transparent hover:border-gray-300 dark:hover:border-white/20"
                    )}
                  >
                    <Image src={url} alt={`Capa pronta ${i + 1}`} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-6 space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState === "uploading"}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 text-[14px] font-bold text-[var(--foreground)] hover:border-[var(--color-teal)] transition-colors disabled:opacity-50"
              >
                {preview ? "subir do meu celular" : "subir do meu celular"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="w-full py-4 rounded-full bg-[var(--color-teal)] text-white text-[15px] font-black disabled:opacity-40 transition-opacity"
              >
                {isPending ? "salvando..." : "salvar capa"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </>
  )
}