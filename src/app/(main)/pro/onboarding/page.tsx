import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{ sacola?: string }>
}

export default async function ProOnboardingPage({ searchParams }: Props) {
  const params = await searchParams
  const qs = params.sacola === "true" ? "?sacola=true" : ""
  redirect(`/pro/anuncio${qs}`)
}
