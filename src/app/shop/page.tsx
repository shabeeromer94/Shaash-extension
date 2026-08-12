import type { Metadata } from "next";
import { getAllProducts, getFilterOptions } from "@/lib/queries/products";
import { getAllHairstyles } from "@/lib/queries/hairstyles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { HairstyleQuickLinks } from "@/components/shop/HairstyleQuickLinks";
import type { ProductFilters } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Hair Extensions",
  description:
    "Browse the full SHAASH Beauty Store collection of synthetic hair extensions — filter by texture, colour, length, price and hairstyle.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters: ProductFilters = {
    texture: firstValue(params.texture) || undefined,
    colour: firstValue(params.colour) || undefined,
    hairstyle: firstValue(params.hairstyle) || undefined,
    minPrice: toNumber(firstValue(params.minPrice)),
    maxPrice: toNumber(firstValue(params.maxPrice)),
    availableOnly: firstValue(params.available) === "true",
    sort: (firstValue(params.sort) as ProductFilters["sort"]) ?? "featured",
  };

  const [products, filterOptions, hairstyles] = await Promise.all([
    getAllProducts(filters),
    getFilterOptions(),
    getAllHairstyles(),
  ]);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="The Collection"
          title="Shop Hair Extensions"
          description={`${products.length} style${products.length === 1 ? "" : "s"} available`}
          className="mb-8"
        />
        <HairstyleQuickLinks hairstyles={hairstyles} activeSlug={filters.hairstyle} />
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <ShopFilters options={filterOptions} hairstyles={hairstyles} activeFilters={filters} />
          <ProductGrid products={products} />
        </div>
      </Container>
    </div>
  );
}
