import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { ShieldAlert, ExternalLink } from "lucide-react"
import { ReportStatusSelect } from "@/components/admin/ReportStatusSelect"
import Link from "next/link"

export default async function AdminReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Confirmação dupla do cargo do utilizador no banco de dados
  const currentUser = await db.user.findUnique({ where: { id: session.user.id } })
  if (currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  // Vai buscar as denúncias com os dados de quem denunciou
  const reports = await db.report.findMany({
    include: {
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header do Admin */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
          <div className="bg-[var(--color-pine)] dark:bg-white p-2 rounded-xl">
            <ShieldAlert className="text-white dark:text-[var(--color-pine)]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Central de Moderação</h1>
            <p className="text-sm text-gray-500 dark:text-sage">Análise e gestão de denúncias da plataforma.</p>
          </div>
        </div>

        {/* Lista de Denúncias (Estilo Cards Mobile-First) */}
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-[var(--color-pine)] p-8 rounded-2xl text-center shadow-sm">
            <p className="text-gray-500 dark:text-sage font-medium">Nenhuma denúncia no momento. Tudo tranquilo! ✌️</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-[var(--color-pine)] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-4">
                
                {/* Linha 1: Contexto e Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-sage/60">
                      ID: {report.id.slice(-6)} • {formatDate(report.createdAt)}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--foreground)] mt-1 flex items-center gap-2">
                      Alvo: {report.targetType === "LISTING" ? "Anúncio" : "Utilizador"}
                      {report.targetType === "LISTING" && (
                        <Link href={`/produto/${report.targetId}`} target="_blank" className="text-[var(--color-teal)] hover:underline flex items-center">
                          <ExternalLink size={14} className="ml-1" />
                        </Link>
                      )}
                    </h3>
                  </div>
                  <ReportStatusSelect reportId={report.id} currentStatus={report.status} />
                </div>

                {/* Linha 2: Motivo */}
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                  <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wide mb-1">
                    Motivo: {report.reason}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    &quot;{report.description || 'Sem descrição adicional.'}&quot;
                  </p>
                </div>

                {/* Linha 3: Quem denunciou */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-sage pt-2 border-t border-gray-100 dark:border-white/5">
                  <span className="font-bold">Denunciante:</span> 
                  {report.reporter.name} ({report.reporter.email})
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}