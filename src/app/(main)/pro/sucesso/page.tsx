import { ProSucessoClient } from "@/components/pro/ProSucessoClient"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export const metadata = {
  title: "Kloop Pro — Confirmado! | Kloop",
}

interface Props {
  searchParams: Promise<{ code?: string }>
}

export default async function ProSucessoPage({ searchParams }: Props) {
  const params = await searchParams

  if (!params.code) redirect("/pro")

  const lot = await db.proLot.findUnique({
    where: { code: params.code },
    select: { code: true, shippingMethod: true, withBag: true },
  })

  if (!lot) redirect("/pro")

  const metodo = lot.shippingMethod === "CORREIOS" ? "correios" : "coleta"

  return (
    <ProSucessoClient
      code={lot.code}
      metodo={metodo}
      withBag={lot.withBag}
    />
  )
}
