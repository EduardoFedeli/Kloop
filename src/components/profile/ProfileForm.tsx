"use client"

import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateProfileAction } from "@/lib/actions/profile"

type GenderPreference = "FEMININE" | "MASCULINE" | "BOTH"

type ProfileData = {
  name: string
  phone: string | null
  avatarUrl: string | null
  genderPreference: GenderPreference | null
}

type Props = {
  profile: ProfileData
}

export function ProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition()
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatarUrl ?? "")
  const [genderPref, setGenderPref] = useState<GenderPreference | null>(profile.genderPreference)
  const avatarDataRef = useRef<string>(profile.avatarUrl ?? "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2 MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      avatarDataRef.current = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Inject avatar (data URL or original URL)
    formData.set("avatarUrl", avatarDataRef.current)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.success) {
        toast.success("Perfil atualizado com sucesso!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const initials = (profile.name || "US").substring(0, 2).toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar upload */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-2">
          Foto de perfil
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative shrink-0 group"
            aria-label="Alterar foto de perfil"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-teal-muted/40"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-teal flex items-center justify-center text-linen text-xl font-bold border-2 border-teal-muted/40">
                {initials}
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </span>
          </button>
          <div className="text-sm text-teal-muted space-y-0.5">
            <p>Clique na foto para alterar</p>
            <p className="text-xs">PNG, JPG ou WEBP · máx. 2 MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Nome <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          type="text"
          defaultValue={profile.name}
          required
          maxLength={100}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-1">Telefone</label>
        <input
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-2">
          O que você prefere ver no feed?
        </label>
        <div className="flex gap-2">
          {(["FEMININE", "MASCULINE", "BOTH"] as const).map((opt) => {
            const labels: Record<typeof opt, string> = { FEMININE: "Feminino", MASCULINE: "Masculino", BOTH: "Ambos" }
            const active = genderPref === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setGenderPref(active ? null : opt)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                  active
                    ? "bg-teal border-teal text-white"
                    : "border-teal-muted/40 text-airforce hover:border-teal"
                )}
              >
                {labels[opt]}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="genderPreference" value={genderPref ?? ""} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-bold text-white transition-colors",
          isPending ? "bg-gray-400 cursor-not-allowed" : "bg-airforce hover:bg-teal"
        )}
      >
        {isPending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  )
}
