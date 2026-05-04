import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AssinaturaClient } from "@/components/assinatura/AssinaturaClient"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Planos | Kloop",
  description: "Escolha o plano ideal para você no Kloop.",
}

export default async function AssinaturaPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Busca a assinatura ativa do usuário
  const userSub = await db.userSubscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true }
  })

  // Se não tiver assinatura no banco, assumimos 'basic'
  const currentPlanSlug = userSub?.plan?.slug || "basic"

  return <AssinaturaClient currentPlanSlug={currentPlanSlug} />
}