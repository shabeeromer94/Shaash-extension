import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllInspiration, getInspirationBySlug } from "@/lib/queries/inspiration";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { InstagramEmbed } from "@/components/inspiration/InstagramEmbed";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getAllInspiration();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getInspirationBySlug(slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.short_description ?? undefined,
    openGraph: item.image_url ? { images: [{ url: item.image_url }] } : undefined,
  };
}

export default async function InspirationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getInspirationBySlug(slug);
  if (!item) notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        {item.instagram_reel_url ? (
          <div className="mb-8">
            <InstagramEmbed url={item.instagram_reel_url} />
          </div>
        ) : (
          item.image_url && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-3xl bg-beige/40">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )
        )}
        <p className="text-xs font-semibold uppercase tracking-label text-gold">Hairstyle Inspiration</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">{item.title}</h1>
        {item.short_description && (
          <p className="mt-4 text-lg text-charcoal-soft">{item.short_description}</p>
        )}
        {item.body && <p className="mt-6 leading-relaxed text-charcoal-soft">{item.body}</p>}
      </Container>

      {item.products && item.products.length > 0 && (
        <Container className="mt-16">
          <SectionHeading align="left" title="Shop This Look" className="mb-8" />
          <ProductGrid products={item.products} />
        </Container>
      )}
    </div>
  );
}
