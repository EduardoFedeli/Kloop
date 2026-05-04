import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { ShieldAlert, User, Store } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  INVESTIGATING: "Investigando",
  RESOLVED: "Resolvido",
  DISMISSED: "Arquivado",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-red-100 text-red-700",
  INVESTIGATING: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-500",
}

export const metadata = { title: "Denúncias — Admin Kloop" }

export default async function AdminDenunciasPage() {
  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } },
    },
  })

  const pending = reports.filter((r) => r.status === "PENDING").length

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-black text-gray-900">Denúncias</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {reports.length} total · {pending} pendente{pending !== 1 ? "s" : ""}
          </p>
        </div>
        {pending > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-[12px] font-black">
            {pending} aguardando análise
          </span>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ShieldAlert size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma denúncia no momento. Tudo tranquilo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {report.targetType === "USER" ? (
                      <User size={14} className="text-gray-500" />
                    ) : (
                      <Store size={14} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">
                      {report.targetType === "USER" ? "Usuário" : "Anúncio"} denunciado
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {report.targetId.slice(0, 12)}…</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${STATUS_COLOR[report.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABEL[report.status] ?? report.status}
                </span>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1">
                  Motivo: {report.reason}
                </p>
                {report.description && (
                  <p className="text-[12px] text-gray-700 leading-relaxed">
                    &quot;{report.description}&quot;
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[12px] text-gray-400 pt-2 border-t border-gray-50">
                <span>
                  <span className="font-bold text-gray-600">{report.reporter.name}</span>
                  {" "}· {report.reporter.email}
                </span>
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
