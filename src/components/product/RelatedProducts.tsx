import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

export function RelatedProducts({
  title = "You May Also Like",
  products,
}: {
  title?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-4">
      <SectionHeading align="left" title={title} className="mb-8" />
      <ProductGrid products={products} />
    </section>
  );
}
