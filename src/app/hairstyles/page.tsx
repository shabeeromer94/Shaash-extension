import type { Metadata } from "next";
import { getAllHairstyles, getHairstyleBySlug } from "@/lib/queries/hairstyles";
import { getProductsByHairstyleSlug } from "@/lib/queries/products";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HairstylePicker } from "@/components/hairstyles/HairstylePicker";
import { ProductGrid } from "@/components/product/ProductGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hairstyle Finder",
  description:
    "Not sure which hair extension suits your look? Pick your hairstyle goal and we'll match you to the right products.",
};

export default async function HairstyleFinderPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const { style } = await searchParams;
  const hairstyles = await getAllHairstyles();
  const [activeStyle, matches] = await Promise.all([
    style ? getHairstyleBySlug(style) : Promise.resolve(null),
    style ? getProductsByHairstyleSlug(style) : Promise.resolve([]),
  ]);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow="Hairstyle Finder"
          title="Find Your Perfect Hair Extension"
          description="Pick the hairstyle you're going for and we'll show you extensions that suit it."
        />
        <div className="mt-12">
          <HairstylePicker hairstyles={hairstyles} activeSlug={style} />
        </div>

        {style && (
          <div id="results" className="mt-16 scroll-mt-24">
            <SectionHeading
              align="left"
              title={activeStyle ? `Best For ${activeStyle.name}` : "Matching Extensions"}
              description={activeStyle?.description ?? undefined}
              className="mb-8"
            />
            <ProductGrid
              products={matches}
              emptyMessage="No products are tagged for this hairstyle yet — check back soon."
            />
          </div>
        )}
      </Container>
    </div>
  );
}
