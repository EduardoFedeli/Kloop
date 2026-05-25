import type { Metadata } from "next"
import { SimuladorClient } from "@/components/admin/simulador/SimuladorClient"

export const metadata: Metadata = { title: "Simulador — Admin Kloop" }

export default function AdminSimuladorPage() {
  return <SimuladorClient />
}
