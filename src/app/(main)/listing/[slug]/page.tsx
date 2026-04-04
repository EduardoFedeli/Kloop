interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  return <div>Anúncio: {slug}</div>;
}
