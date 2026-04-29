import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MapPin } from "lucide-react"
import { AddressForm } from "@/components/perfil/AddressForm"

interface Props {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function CompletarPerfilPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { redirectTo } = await searchParams
  const destination = redirectTo ?? "/"

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-lg mx-auto px-5 py-10 pb-24">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} className="text-[var(--color-teal)]" />
          </div>
          <h1 className="text-[22px] font-black text-[var(--foreground)] tracking-tight leading-tight">
            antes de continuar
          </h1>
        </div>
        <p className="text-[14px] text-gray-500 dark:text-sage mb-8 pl-[52px]">
          precisamos do seu endereço para calcular o frete e finalizar pedidos.
        </p>

        <AddressForm redirectTo={destination} />
      </div>
    </div>
  )
}
