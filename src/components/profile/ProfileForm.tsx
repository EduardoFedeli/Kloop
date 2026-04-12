"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateProfileAction } from "@/lib/actions/profile"

type ProfileData = {
  name: string
  bio: string | null
  phone: string | null
  avatarUrl: string | null
}

type Props = {
  profile: ProfileData
}

export function ProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.success) {
        toast.success("Perfil atualizado com sucesso!")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label className="block text-sm font-medium text-airforce mb-1">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={500}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm resize-none"
          placeholder="Fale um pouco sobre você..."
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
        <label className="block text-sm font-medium text-airforce mb-1">URL do Avatar</label>
        <input
          name="avatarUrl"
          type="url"
          defaultValue={profile.avatarUrl ?? ""}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="https://..."
        />
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
