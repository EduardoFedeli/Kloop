import type { Metadata } from "next"
import { VendasClient } from "@/components/admin/vendas/VendasClient"

export const metadata: Metadata = { title: "Vendas — Admin Kloop" }

export default function AdminVendasPage() {
  return <VendasClient />
}
