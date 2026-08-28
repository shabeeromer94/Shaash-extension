import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts, getFilterOptions } from "@/lib/queries/products";
import { getAllHairstyles } from "@/lib/queries/hairstyles";
import { getAllCategories } from "@/lib/queries/categories";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AccessoryGroupGrid } from "@/components/product/AccessoryGroupGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { HairstyleQuickLinks } from "@/components/shop/HairstyleQuickLinks";
import { CategoryQuickLinks } from "@/components/shop/CategoryQuickLinks";
import { slugify } from "@/lib/utils/slug";
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

// Hair Extensions is the primary product line — landing on a bare /shop
// (no ?category= at all) defaults to it instead of showing everything.
// ?category=all is the explicit escape hatch for the unfiltered view.
const DEFAULT_CATEGORY_SLUG = "hair-extensions";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const rawCategory = firstValue(params.category);
  // "all" is an explicit request to clear the default; undefined means the
  // param was never in the URL, which is where the default kicks in.
  const activeCategorySlug = rawCategory === "all" ? "all" : rawCategory ?? DEFAULT_CATEGORY_SLUG;
  const categoryDbFilter = activeCategorySlug === "all" ? undefined : activeCategorySlug;

  const filters: ProductFilters = {
    category: categoryDbFilter,
    texture: firstValue(params.texture) || undefined,
    colour: firstValue(params.colour) || undefined,
    hairstyle: firstValue(params.hairstyle) || undefined,
    minPrice: toNumber(firstValue(params.minPrice)),
    maxPrice: toNumber(firstValue(params.maxPrice)),
    availableOnly: firstValue(params.available) === "true",
    sort: (firstValue(params.sort) as ProductFilters["sort"]) ?? "featured",
  };

  const [products, filterOptions, hairstyles, categories] = await Promise.all([
    getAllProducts(filters),
    getFilterOptions(),
    getAllHairstyles(),
    getAllCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoryDbFilter);
  const categoryLabel = activeCategory ? activeCategory.name : "All Products";

  // Products sharing an accessory_group (e.g. 5 Kunjalam designs) collapse
  // into one family tile on the category page — ?group= drills into just
  // that family's real products. Generic: any category with grouped
  // products gets this treatment, not just Hair Accessories.
  const rawGroup = firstValue(params.group);
  const groupNames = Array.from(new Set(products.map((p) => p.accessory_group).filter((g): g is string => !!g)));
  const activeGroupName = rawGroup ? groupNames.find((name) => slugify(name) === rawGroup) : undefined;
  const displayProducts = activeGroupName ? products.filter((p) => p.accessory_group === activeGroupName) : products;
  const showGroupTiles = !activeGroupName && groupNames.length > 0;

  const heading = activeGroupName ?? categoryLabel;

  return (
    <div className="py-12 sm:py-16">
      <Container>
        {activeGroupName && (
          <Link
            href={`/shop?category=${activeCategorySlug}`}
            className="mb-4 inline-block text-sm text-charcoal-soft hover:text-charcoal"
          >
            ← Back to {categoryLabel}
          </Link>
        )}
        <SectionHeading
          align="left"
          eyebrow="The Collection"
          title={
            <>
              <span className="text-gold">Shop</span>
              <span className="text-charcoal-soft"> — </span>
              {heading}
            </>
          }
          description={`${displayProducts.length} ${displayProducts.length === 1 ? "product" : "products"} available`}
          className="mb-8"
        />
        <CategoryQuickLinks categories={categories} activeSlug={activeCategorySlug} />
        <HairstyleQuickLinks hairstyles={hairstyles} activeSlug={filters.hairstyle} />
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <ShopFilters
            options={filterOptions}
            hairstyles={hairstyles}
            categories={categories}
            activeFilters={filters}
            activeCategorySlug={activeCategorySlug}
          />
          {showGroupTiles ? (
            <AccessoryGroupGrid products={displayProducts} categorySlug={activeCategorySlug} />
          ) : (
            <ProductGrid products={displayProducts} />
          )}
        </div>
      </Container>
    </div>
  );
}
