import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";
import { getAvailability } from "@/lib/utils/stock";
import { StockBadge } from "@/components/product/StockBadge";

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const status = getAvailability(product);

  return (
    <Link href={`/products/${product.code}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-beige/40">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-taupe">
            Image coming soon
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StockBadge status={status} />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-label text-taupe">#{product.code}</p>
          <h3 className="mt-1 font-display text-lg leading-snug text-charcoal">{product.name}</h3>
          {product.length_label && <p className="mt-1 text-sm text-charcoal-soft">{product.length_label}</p>}
        </div>
        <p className="whitespace-nowrap font-medium text-charcoal">{formatINR(product.price_inr)}</p>
      </div>
    </Link>
  );
}
