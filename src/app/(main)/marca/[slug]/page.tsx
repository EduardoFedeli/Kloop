import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { ProfileStoreClient } from "@/components/profile/ProfileStoreClient"
import { ListingStatus } from "@prisma/client"

interface MarcaPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function MarcaStorePage({ params, searchParams }: MarcaPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const session = await auth()

  // 1. Busca a marca e os dados básicos para as facetas (filtros)
  const marca = await db.brand.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: {
        select: { 
          listings: { where: { status: ListingStatus.ACTIVE } },
          followers: true 
        }
      }
    }
  })

  if (!marca) notFound()

  // 2. Busca os anúncios da marca (filtros simplificados para a vitrine da marca)
  const listings = await db.listing.findMany({
    where: {
      brandId: marca.id,
      status: ListingStatus.ACTIVE,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: true,
      images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true, altText: true } },
      seller: { 
        select: { 
          id: true, 
          name: true, 
          avatarUrl: true, 
          addresses: { where: { isDefault: true }, select: { city: true, state: true }, take: 1 } 
        } 
      },
      _count: { select: { favorites: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // 3. Verifica se o usuário logado segue esta marca
  const isFollowing = session?.user?.id 
    ? !!(await db.brandFollow.findUnique({
        where: { userId_brandId: { userId: session.user.id, brandId: marca.id } }
      }))
    : false

  // Transformamos os dados da marca para "fingir" que é um perfil de usuário
  // Assim reaproveitamos 100% do seu componente ProfileStoreClient
  const brandAsUser = {
    id: marca.id,
    name: marca.name,
    bio: `Produtos da marca ${marca.name} anunciados pela comunidade Kloop.`,
    avatarUrl: marca.logoUrl || null,
    coverUrl: null,
    createdAt: marca.createdAt,
  }

  return (
    <ProfileStoreClient
      user={brandAsUser as any}
      isOwn={false}
      listings={listings as any}
      reviews={[]} // Marcas não recebem reviews, apenas os vendedores das peças
      avgRating={null}
      totalRatings={0}
      planName="Marca Oficial"
      planVariant="pro"
      megaphonesAvailable={0}
      itemsSold={0} // Opcional: buscar total vendido da marca no futuro
      followersCount={marca._count.followers}
      initialIsFollowing={isFollowing}
      storeBrands={[]} // Não precisa de filtro de marca dentro da página da própria marca
      storeConditions={['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']}
      storeSizes={[]} 
      storeCategories={[]} // Pode popular se quiser filtros de categoria na loja da marca
      currentParams={sp}
      userLocation={null}
      isBrandStore={true} // Nova prop para você ajustar pequenos textos na UI se quiser
    />
  )
}