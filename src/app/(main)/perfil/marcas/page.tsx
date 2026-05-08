import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Tag } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default async function MinhasMarcasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Busca marcas seguidas e traz 10 produtos recentes de cada uma
  const followedBrands = await db.brandFollow.findMany({
    where: { userId: session.user.id },
    include: {
      brand: {
        include: {
          listings: {
            where: { status: "ACTIVE" },
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              images: { take: 1, orderBy: { displayOrder: "asc" } }
            }
          }
        }
      }
    }
  })

  if (followedBrands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Tag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-[var(--foreground)] mb-2">siga suas marcas do coração</h2>
        <p className="text-sm text-gray-500 dark:text-sage mb-8">fique de olho nas novidades das suas marcas favoritas.</p>
        <Link href="/search" className="bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] px-8 py-3 rounded-full font-bold text-sm">
          explorar por aí
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="px-5 pt-6 mb-8">
        <h1 className="text-2xl font-black text-[var(--color-pine)] dark:text-white">minhas marcas</h1>
        <p className="text-sm text-gray-500">Acompanhe as novidades do que você segue</p>
      </div>

      <div className="space-y-10">
        {followedBrands.map(({ brand }) => (
          <section key={brand.id} className="space-y-4">
            {/* Header da Seção da Marca */}
            <div className="px-5 flex items-center justify-between">
              <Link href={`/marca/${brand.slug}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-white/10 overflow-hidden relative bg-white">
                  {brand.logoUrl ? (
                    <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-teal)] text-white font-bold">
                      {brand.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[var(--foreground)] group-hover:underline">{brand.name.toLowerCase()}</h3>
                  <p className="text-[12px] text-gray-500">ver loja oficial</p>
                </div>
              </Link>
              <Link href={`/marca/${brand.slug}`} className="p-2 text-gray-400">
                <ChevronRight size={20} />
              </Link>
            </div>

            {/* Carrossel Horizontal de Produtos */}
            <div className="flex overflow-x-auto gap-4 px-5 no-scrollbar snap-x">
              {brand.listings.map((listing) => (
                <Link 
                  key={listing.id} 
                  href={`/listing/${listing.slug}`}
                  className="flex-shrink-0 w-32 snap-start space-y-2"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 relative">
                    {listing.images[0] && (
                      <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" />
                    )}
                  </div>
                  <p className="text-[13px] font-black text-[var(--foreground)] truncate">
                    {formatPrice(listing.priceCents)}
                  </p>
                </Link>
              ))}
              
              {/* Card de "Ver Mais" no final do carrossel */}
              <Link 
                href={`/marca/${brand.slug}`}
                className="flex-shrink-0 w-32 snap-start aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-4 group"
              >
                <ChevronRight className="text-gray-300 group-hover:text-[var(--color-teal)] transition-colors mb-2" />
                <p className="text-[11px] font-bold text-gray-400">ver todos os itens</p>
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}