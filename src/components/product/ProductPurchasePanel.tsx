"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";
import { getAvailability, isPurchasable } from "@/lib/utils/stock";
import { cn } from "@/lib/utils/cn";
import { StockBadge } from "@/components/product/StockBadge";
import { AddToCartButton } from "@/components/product/AddToCartButton";

/**
 * Owns the "which variant is selected" state for products that have size
 * options (e.g. Sponge Hair Donut — Small/Medium/Big at different prices),
 * and drives the price, stock badge, and Add to Cart button off of it. For
 * a product with no variants, this renders exactly what ProductInfo used to
 * render inline — variants are purely additive.
 */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variants.find((v) => v.stock_quantity > 0)?.id ?? variants[0]?.id
  );
  const activeVariant = hasVariants ? variants.find((v) => v.id === selectedVariantId) : undefined;

  const price = activeVariant ? activeVariant.price_inr : product.price_inr;
  const stockQuantity = activeVariant ? activeVariant.stock_quantity : product.stock_quantity;
  const status = getAvailability({
    stock_quantity: stockQuantity,
    low_stock_threshold: product.low_stock_threshold,
    is_hidden: product.is_hidden,
  });
  const purchasable = isPurchasable({
    stock_quantity: stockQuantity,
    low_stock_threshold: product.low_stock_threshold,
    is_hidden: product.is_hidden,
  });

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-2xl font-medium text-charcoal">{formatINR(price)}</p>
        <StockBadge status={status} />
      </div>

      {hasVariants && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-label text-taupe">Size</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const outOfStock = variant.stock_quantity <= 0;
              const active = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={outOfStock}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-line text-charcoal hover:border-charcoal",
                    outOfStock && "cursor-not-allowed opacity-40"
                  )}
                >
                  {variant.label} — {formatINR(variant.price_inr)}
                  {outOfStock && " (Out of Stock)"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {purchasable ? (
        <AddToCartButton
          productCode={product.code}
          name={hasVariants && activeVariant ? `${product.name} — ${activeVariant.label}` : product.name}
          image={primaryImage?.image_url ?? ""}
          price={price}
          maxQuantity={Math.max(stockQuantity, 1)}
          variantId={activeVariant?.id}
          variantLabel={activeVariant?.label}
        />
      ) : (
        <p className="rounded-xl bg-beige/60 px-4 py-3 text-sm font-medium text-charcoal-soft">
          This product is currently unavailable — check back soon or explore similar styles below.
        </p>
      )}
    </div>
  );
}
