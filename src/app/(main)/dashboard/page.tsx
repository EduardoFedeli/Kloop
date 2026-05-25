import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { AddressSection } from "@/components/profile/AddressSection"
import { MyListings } from "@/components/listing/MyListings"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const [user, listings] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        genderPreference: true,
        createdAt: true,
        addresses: { orderBy: { createdAt: "asc" } },
        subscription: {
          include: { plan: { select: { name: true, maxActiveListings: true } } },
        },
        _count: { select: { listings: { where: { status: "ACTIVE" } } } },
      },
    }),
    db.listing.findMany({
      where: { sellerId: session.user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        priceCents: true,
        status: true,
        createdAt: true,
        viewsCount: true,
        images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!user) redirect("/")

  const maxListings = user.subscription?.plan?.maxActiveListings ?? 5
  const activeCount = user._count.listings

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-airforce">Minha conta</h1>
          <p className="text-sm text-teal-muted mt-1">Membro desde {formatDate(user.createdAt)}</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-airforce text-white text-sm font-bold rounded-full hover:bg-teal transition-colors"
        >
          <PlusCircle size={16} />
          Novo anúncio
        </Link>
      </div>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <h2 className="text-lg font-bold text-airforce mb-4">Editar perfil</h2>
        <ProfileForm
          profile={{
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            genderPreference: user.genderPreference,
          }}
        />
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <h2 className="text-lg font-bold text-airforce mb-4">Endereços</h2>
        <AddressSection addresses={user.addresses} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-airforce">Meus anúncios</h2>
          <span className="text-sm text-teal-muted">
            {activeCount} de {maxListings === -1 ? "∞" : maxListings} ativos
          </span>
        </div>
        <MyListings listings={listings} />
      </section>
    </div>
  )
}
