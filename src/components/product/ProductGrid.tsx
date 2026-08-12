import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({
  products,
  emptyMessage = "No products match these filters yet.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-charcoal-soft">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
