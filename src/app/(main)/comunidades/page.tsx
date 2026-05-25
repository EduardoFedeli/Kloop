import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserCommunities } from "@/lib/data/communities"
import Link from "next/link"
import { Building2 } from "lucide-react"

export const metadata = { title: "Minhas Comunidades — Kloop" }

function formatMemberSince(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export default async function ComunidadesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/comunidades`)
  }

  const communities = await getUserCommunities(session.user.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center">
          <Building2 size={20} className="text-[var(--color-teal)]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[var(--foreground)]">Minhas Comunidades</h1>
          <p className="text-sm text-gray-500 dark:text-sage">Anúncios exclusivos do seu condomínio ou clube</p>
        </div>
      </div>

      {communities.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Building2 size={48} className="mx-auto text-gray-200 dark:text-white/10 mb-4" />
          <p className="font-bold text-[var(--foreground)] mb-2">Você não pertence a nenhuma comunidade no momento</p>
          <p className="text-sm text-gray-500 dark:text-sage leading-relaxed max-w-sm mx-auto">
            Comunidades Kloop são exclusivas para condomínios e clubes parceiros. Entre em contato com seu síndico ou responsável para solicitar acesso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/comunidades/${community.slug}`}
              className="group block bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-[var(--color-teal)]/30 dark:hover:border-[var(--color-celadon)]/30 transition-all overflow-hidden"
            >
              <div className="h-24 bg-gradient-to-br from-[var(--color-frosted)] to-[var(--color-celadon)] dark:from-[var(--color-emerald)] dark:to-[var(--color-pine)] flex items-center justify-center">
                {community.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={community.logoUrl} alt={community.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={36} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)] opacity-60" />
                )}
              </div>

              <div className="p-4 space-y-2">
                <p className="font-black text-[15px] text-[var(--foreground)] group-hover:text-[var(--color-teal)] dark:group-hover:text-[var(--color-celadon)] transition-colors line-clamp-1">
                  {community.name}
                </p>
                {community.description && (
                  <p className="text-[13px] text-gray-500 dark:text-sage line-clamp-2 leading-relaxed">
                    {community.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] bg-[var(--color-teal)]/10 dark:bg-[var(--color-celadon)]/10 px-2 py-0.5 rounded-full">
                    {community.memberCount} {community.memberCount === 1 ? "membro" : "membros"}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-sage/60">
                    Membro desde {formatMemberSince(community.memberSince)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
