import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProOnboardingClient } from "@/components/pro/ProOnboardingClient"

export const metadata = {
  title: "Kloop Pro — Enviar lote | Kloop",
}

interface Props {
  searchParams: Promise<{ sacola?: string }>
}

export default async function ProAnuncioPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams

  const address = await db.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
    select: {
      id: true,
      label: true,
      street: true,
      number: true,
      complement: true,
      neighborhood: true,
      city: true,
      state: true,
      zipCode: true,
    },
  })

  return (
    <ProOnboardingClient
      withBag={params.sacola === "true"}
      address={address ?? undefined}
    />
  )
}
