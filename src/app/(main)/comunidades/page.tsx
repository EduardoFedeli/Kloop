import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserCommunities } from "@/lib/data/communities"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { CircuitBackground } from "@/components/layout/CircuitBackground"
import { ComunidadesViewToggler } from "@/components/comunidades/ComunidadesViewToggler"

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
    <div className="relative min-h-[80vh] -mx-4 -mt-6 px-4 py-8" style={{ background: "var(--color-eclipse)" }}>
      <CircuitBackground />

      <ComunidadesViewToggler>
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(9,86,255,0.16)",
              border: "1px solid rgba(76,126,255,0.4)",
            }}
          >
            <Building2 size={20} className="text-neon-lift" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neon-mist">Minhas Comunidades</h1>
            <p className="text-sm text-sky-ice">Anúncios exclusivos do seu condomínio ou clube</p>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Building2 size={48} className="mx-auto text-neon-lift/20 mb-4" />
            <p className="font-bold text-neon-mist mb-2">Você não pertence a nenhuma comunidade no momento</p>
            <p className="text-sm text-sky-ice/70 leading-relaxed max-w-sm mx-auto">
              Comunidades Kloop são exclusivas para condomínios e clubes parceiros. Entre em contato com seu síndico ou responsável para solicitar acesso.
            </p>
            <Link
              href="/comunidades/sobre"
              className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-bold text-neon-lift hover:text-electric-sky transition-colors"
            >
              saiba mais sobre as comunidades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/comunidades/${community.slug}`}
                className="community-card group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(9,86,255,0.12), rgba(76,126,255,0.06))",
                  }}
                >
                  {community.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={community.logoUrl} alt={community.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={36} className="text-neon-lift/40" />
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <p className="font-black text-[15px] text-neon-mist group-hover:text-neon-lift transition-colors line-clamp-1">
                    {community.name}
                  </p>
                  {community.description && (
                    <p className="text-[13px] text-sky-ice/70 line-clamp-2 leading-relaxed">
                      {community.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-[11px] font-bold text-electric-sky px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(76,126,255,0.14)",
                        border: "1px solid rgba(76,126,255,0.3)",
                      }}
                    >
                      {community.memberCount} {community.memberCount === 1 ? "membro" : "membros"}
                    </span>
                    <span className="text-[11px] text-sky-ice/50">
                      Membro desde {formatMemberSince(community.memberSince)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </ComunidadesViewToggler>
    </div>
  )
}

