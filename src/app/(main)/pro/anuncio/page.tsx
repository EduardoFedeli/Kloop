import { ProOnboardingClient } from "@/components/pro/ProOnboardingClient"

export const metadata = {
  title: "Kloop Pro — Enviar lote | Kloop",
}

interface Props {
  searchParams: Promise<{ sacola?: string }>
}

export default async function ProAnuncioPage({ searchParams }: Props) {
  const params = await searchParams
  const withBag = params.sacola === "true"
  return <ProOnboardingClient withBag={withBag} />
}
