import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";

/**
 * A tile representing a whole product family (e.g. "Kunjalam" — 5 designs)
 * rather than one SKU. Uses the first product's primary photo as the
 * thumbnail; clicking drills into just that family's products via
 * `/shop?category=...&group=...`.
 */
export function AccessoryGroupCard({
  groupName,
  products,
  categorySlug,
}: {
  groupName: string;
  products: Product[];
  categorySlug: string;
}) {
  const representative = products[0];
  const primaryImage = representative.images?.find((img) => img.is_primary) ?? representative.images?.[0];

  return (
    <Link href={`/shop?category=${categorySlug}&group=${slugify(groupName)}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-beige/40">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text ?? groupName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-taupe">
            Image coming soon
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg leading-snug text-charcoal">{groupName}</h3>
        <p className="mt-1 text-sm text-charcoal-soft">
          {products.length} {products.length === 1 ? "option" : "options"} available
        </p>
      </div>
    </Link>
  );
}
