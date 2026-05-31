import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { Package, Truck, ChevronRight } from "lucide-react"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando envio",
  RECEIVED: "Recebido",
  ANALYZING: "Em análise",
  ACTIVE: "Ativo",
  DONE: "Finalizado",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  ANALYZING: "bg-purple-100 text-purple-700",
  ACTIVE: "bg-green-100 text-green-700",
  DONE: "bg-gray-100 text-gray-500",
}

export const metadata = { title: "Lotes — Admin Kloop" }

export default async function AdminLotesPage() {
  const lots = await db.proLot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-gray-900">Lotes Kloop Pro</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {lots.length} {lots.length === 1 ? "lote" : "lotes"} no total
        </p>
      </div>

      {lots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum lote enviado ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Usuário</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Envio</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Peças</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase text-[11px] tracking-wide">Data</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-black text-gray-900 tracking-wider">{lot.code}</span>
                    {lot.withBag && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        + SACOLA
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-800">{lot.user.name}</p>
                    <p className="text-gray-400 text-[12px]">{lot.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {lot.shippingMethod === "CORREIOS" ? (
                        <><Package size={13} /> Correios</>
                      ) : (
                        <><Truck size={13} /> Coleta</>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-gray-700">{lot._count.items}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_COLOR[lot.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[lot.status] ?? lot.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {formatDate(lot.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/lotes/${lot.id}`}
                      className="flex items-center gap-1 text-[12px] font-bold text-[var(--color-teal)] hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                      Avaliar <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
