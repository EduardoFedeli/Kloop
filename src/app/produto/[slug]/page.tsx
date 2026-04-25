import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Star,
  MapPin,
  Package,
  ShoppingBag,
  CalendarDays,
  Clock,
  Shield,
  Tag,
  Lock,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { ProductImageCarousel } from "@/components/produto/ProductImageCarousel";
import { ProductActions } from "@/components/produto/ProductActions";
import type { ListingCondition } from "@prisma/client";

const conditionLabel: Record<ListingCondition, string> = {
  NEW: "novo",
  LIKE_NEW: "seminovo",
  GOOD: "bom estado",
  FAIR: "usado",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          addresses: {
            where: { isDefault: true },
            select: { city: true, state: true, zipCode: true },
            take: 1,
          },
          reviewsReceived: { select: { rating: true } },
          _count: {
            select: {
              listings: { where: { status: "ACTIVE" } },
              saleTransactions: { where: { status: "COMPLETED" } },
            },
          },
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
      images: { orderBy: { displayOrder: "asc" } },
      _count: { select: { favorites: true } },
    },
  });

  if (!listing || listing.status === "DRAFT") notFound();

  // Incrementa view de forma assíncrona
  void db.listing
    .update({
      where: { id: listing.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  const isOwner = session?.user?.id === listing.sellerId;
  const isFavorited = session?.user?.id
    ? (await db.favorite.findUnique({
        where: {
          userId_listingId: { userId: session.user.id, listingId: listing.id },
        },
      })) !== null
    : false;

  const { seller } = listing;
  const sellerAddress = seller.addresses[0];
  const totalRatings = seller.reviewsReceived.length;
  const avgRating =
    totalRatings > 0
      ? (
          seller.reviewsReceived.reduce((s, r) => s + r.rating, 0) /
          totalRatings
        ).toFixed(1)
      : null;
  const sellerInitials = seller.name.substring(0, 2).toUpperCase();

  const installmentCents = Math.ceil(listing.priceCents / 12);
  // Mock de cashback (5%)
  const cashbackCents = Math.round(listing.priceCents * 0.05);
  // Mock de Bate e Volta (10%)
  const bateVoltaCents = Math.round(listing.priceCents * 0.1);

  // Breadcrumbs (ex: roupas / blusas / esporte)
  const breadcrumbs = [listing.category.parent?.name, listing.category.name]
    .filter(Boolean)
    .join(" / ")
    .toLowerCase();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto pb-36 bg-white dark:bg-[var(--color-pine)] min-h-screen">
        {/* Carrossel de Imagens */}
        <ProductImageCarousel
          images={listing.images}
          title={listing.title}
          listingId={listing.id}
          initialFavorited={isFavorited}
          initialFavoritesCount={listing._count.favorites}
          categorySlug={listing.category.slug}
        />

        <div className="px-5 mt-5 space-y-8">
          {/* Header do Produto */}
          <section className="space-y-1">
            {breadcrumbs && (
              <p className="text-[13px] text-gray-500 dark:text-sage font-medium tracking-tight">
                {breadcrumbs}
              </p>
            )}
            <h1 className="text-xl font-bold text-[var(--foreground)] leading-tight">
              {listing.title.toLowerCase()}
            </h1>
          </section>

          {/* Bloco de Preço e Benefícios */}
          <section className="space-y-4">
            <div>
              <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">
                {formatPrice(listing.priceCents)}
              </p>
              <p className="text-[13px] text-gray-500 dark:text-sage mt-0.5">
                em até 12x {formatPrice(installmentCents)} sem juros
              </p>
            </div>

            {/* Badge Cashback */}
            <div className="inline-flex items-center gap-1.5 bg-[#b7e4c7] dark:bg-[var(--color-teal)] text-[var(--color-pine)] dark:text-white text-xs font-bold px-3 py-1.5 rounded-md">
              <RotateCcw size={14} className="stroke-[2.5px]" />
              receba {formatPrice(cashbackCents)} de volta
            </div>

            {/* Frete Calculator Mock */}
            <div className="flex items-center justify-between text-[13px] text-gray-500 dark:text-sage pt-2">
              <div className="flex gap-1.5">
                <span>R$ 4,99 de frete para o cep</span>
                <span className="font-bold text-[var(--foreground)]">
                  {sellerAddress?.zipCode || "01310-100"}
                </span>
              </div>
              <button className="text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-bold">
                alterar cep
              </button>
            </div>

            {/* Bate e Volta Banner */}
            <div className="bg-[#e9f5db] dark:bg-[var(--color-emerald)]/30 border border-[#b7e4c7] dark:border-[var(--color-teal)]/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] text-[var(--color-pine)] dark:text-[var(--color-frosted)]">
                  use{" "}
                  <span className="font-black text-[var(--color-pine)] dark:text-white">
                    {formatPrice(bateVoltaCents)}
                  </span>{" "}
                  do seu bate e volta
                </p>
                <p className="text-xs text-[var(--color-teal)] dark:text-sage mt-0.5 font-medium">
                  desconto aplicado no checkout
                </p>
              </div>
              <div className="w-5 h-5 rounded border-2 border-[var(--color-pine)] dark:border-white"></div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Descrição */}
          <section>
            <h2 className="text-[15px] font-bold text-[var(--foreground)] mb-3">
              descrição do produto
            </h2>
            <p className="text-[14px] text-gray-700 dark:text-[var(--color-frosted)] whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Informações do Produto (Grid) */}
          <section>
            <h2 className="text-[15px] font-bold text-[var(--foreground)] mb-4">
              informações do produto
            </h2>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[13px] text-gray-500 dark:text-sage mb-1.5">
                  tamanho
                </p>
                <span className="bg-[#e9f5db] dark:bg-[var(--color-teal)]/20 text-[var(--color-pine)] dark:text-[var(--color-celadon)] font-bold text-xs px-2.5 py-1 rounded">
                  {listing.size || "único"}
                </span>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 dark:text-sage mb-1.5">
                  condição do produto
                </p>
                <span className="bg-[#e9f5db] dark:bg-[var(--color-teal)]/20 text-[var(--color-pine)] dark:text-[var(--color-celadon)] font-bold text-xs px-2.5 py-1 rounded">
                  {conditionLabel[listing.condition]}
                </span>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Marca e Ação */}
          {listing.brand && (
            <section className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-gray-500 dark:text-sage mb-1">
                  marca
                </p>
                <p className="font-bold text-[14px] text-[var(--foreground)]">
                  {listing.brand}
                </p>
              </div>
              <button className="text-[13px] font-bold text-[var(--color-pine)] dark:text-white border border-[var(--color-pine)] dark:border-white rounded-full px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                seguir
              </button>
            </section>
          )}

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Venda um Similar */}
          <section>
            <div className="flex gap-4 items-center">
              {/* Fallback de thumbnail caso não tenha a foto */}
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[var(--color-forest)] overflow-hidden flex-shrink-0">
                {listing.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.images[0].url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-[var(--foreground)]">
                  tem um produto parecido parado no armário?
                </p>
                <p className="text-[13px] text-gray-500 dark:text-sage mt-0.5">
                  use este anúncio como modelo.
                </p>
              </div>
            </div>
            <Link
              href="/create"
              className="mt-4 block w-full text-center text-[14px] font-bold text-[var(--color-pine)] dark:text-white border border-[var(--color-pine)] dark:border-white rounded-full py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              venda um similar
            </Link>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Perfil do Vendedor (Mini Dashboard) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${seller.id}`}
                className="flex items-center gap-3"
              >
                {seller.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={seller.avatarUrl}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white font-bold text-sm">
                    {sellerInitials}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[15px] text-[var(--foreground)] hover:underline">
                    {seller.name.toLowerCase()}
                  </p>
                  {sellerAddress && (
                    <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
                      {sellerAddress.city.toLowerCase()},{" "}
                      {sellerAddress.state.toLowerCase()}
                    </p>
                  )}
                </div>
              </Link>
              <button className="text-[13px] font-bold text-[var(--color-pine)] dark:text-white border border-[var(--color-pine)] dark:border-white rounded-full px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                seguir
              </button>
            </div>

            {/* Estrelas */}
            {avgRating && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(Number(avgRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                      }
                    />
                  ))}
                </div>
                <span className="text-[13px] font-bold text-[var(--color-pine)] dark:text-[var(--color-frosted)] ml-2">
                  ({totalRatings} avaliações)
                </span>
              </div>
            )}

            {/* Stats do Vendedor */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2">
              <div>
                <p className="text-[12px] text-gray-500 dark:text-sage mb-0.5">
                  produtos à venda
                </p>
                <p className="font-bold text-[14px] text-[var(--foreground)]">
                  {seller._count.listings}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 dark:text-sage mb-0.5">
                  produtos vendidos
                </p>
                <p className="font-bold text-[14px] text-[var(--foreground)]">
                  {seller._count.saleTransactions}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 dark:text-sage mb-0.5">
                  tempo médio de envio
                </p>
                <p className="font-bold text-[14px] text-[var(--foreground)]">
                  2 dias
                </p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 dark:text-sage mb-0.5">
                  no kloop desde
                </p>
                <p className="font-bold text-[14px] text-[var(--foreground)]">
                  {formatDate(seller.createdAt).split(" ")[0]}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Dúvidas (Apenas para não-donos) */}
          {!isOwner && (
            <section>
              <h2 className="text-[15px] font-bold text-[var(--foreground)] mb-1">
                faça sua pergunta
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-sage mb-4">
                tire suas dúvidas com a gente
              </p>
              <ProductActions
                listingId={listing.id}
                listingStatus={listing.status}
                currentUserId={session?.user?.id}
                chatOnly
              />
            </section>
          )}

          {/* Políticas e Segurança (Estilo Lista) */}
          <section className="bg-gray-50 dark:bg-[var(--color-forest)] rounded-2xl p-5 space-y-6">
            {/* Segurança */}
            <div className="flex gap-4">
              <Lock
                size={20}
                className="text-[var(--foreground)] flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[14px] font-bold text-[var(--foreground)] mb-1">
                  não caia em golpes
                </p>
                <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
                  nunca transfira dinheiro ou se comunique fora do site ou
                  aplicativo do kloop.
                </p>
                <button className="text-[13px] font-bold text-[var(--color-pine)] dark:text-white mt-2">
                  mais dicas de segurança
                </button>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-white/5" />

            {/* Devolução */}
            <div className="flex gap-4">
              <Package
                size={20}
                className="text-[var(--foreground)] flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[var(--foreground)] mb-1">
                  se não gostar, você pode devolver
                </p>
                <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
                  a partir da data de recebimento do produto, você tem 7 dias
                  corridos para solicitar a devolução.
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-white/5" />

            {/* Denúncia */}
            <div className="flex gap-4">
              <AlertTriangle
                size={20}
                className="text-[var(--foreground)] flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[var(--foreground)] mb-1">
                  denúncia
                </p>
                <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
                  encontrou algo de errado com esse anúncio? denuncie-o aqui.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Barra de ações fixa na base */}
      {!isOwner && (
        <ProductActions
          listingId={listing.id}
          listingStatus={listing.status}
          currentUserId={session?.user?.id}
        />
      )}
    </div>
  );
}
