import type { Product } from "@/lib/types";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { SuitableHairstyles } from "@/components/product/SuitableHairstyles";

export function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-label text-taupe">Product #{product.code}</p>
        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
      </div>

      <ProductPurchasePanel product={product} />

      <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-cream p-5 sm:grid-cols-3">
        {product.length_label && (
          <div>
            <dt className="text-xs uppercase tracking-label text-taupe">Length</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal">{product.length_label}</dd>
          </div>
        )}
        {product.texture && (
          <div>
            <dt className="text-xs uppercase tracking-label text-taupe">Texture</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal">{product.texture}</dd>
          </div>
        )}
        {product.colour && (
          <div>
            <dt className="text-xs uppercase tracking-label text-taupe">Colour</dt>
            <dd className="mt-1 text-sm font-medium text-charcoal">{product.colour}</dd>
          </div>
        )}
      </dl>

      {product.description && (
        <p className="leading-relaxed text-charcoal-soft">{product.description}</p>
      )}

      {product.hairstyles && product.hairstyles.length > 0 && (
        <SuitableHairstyles hairstyles={product.hairstyles} />
      )}
    </div>
  );
}
