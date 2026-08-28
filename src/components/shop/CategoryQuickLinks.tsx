import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * Pill tabs at the top of /shop — one per category (Hair Extensions first,
 * as the primary/default line) plus "All Products" last as the explicit
 * unfiltered escape hatch — so browsing one product type doesn't require
 * wading through the others. Links straight to `/shop?category=slug`
 * (`?category=all` for the unfiltered view).
 */
export function CategoryQuickLinks({
  categories,
  activeSlug,
}: {
  categories: Category[];
  /** A category slug, or the literal "all" for the unfiltered tab. */
  activeSlug: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-label transition-colors",
              active ? "border-charcoal bg-charcoal text-ivory" : "border-line text-charcoal-soft hover:border-charcoal"
            )}
          >
            {category.name}
          </Link>
        );
      })}
      <Link
        href="/shop?category=all"
        className={cn(
          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-label transition-colors",
          activeSlug === "all"
            ? "border-charcoal bg-charcoal text-ivory"
            : "border-line text-charcoal-soft hover:border-charcoal"
        )}
      >
        All Products
      </Link>
    </div>
  );
}
