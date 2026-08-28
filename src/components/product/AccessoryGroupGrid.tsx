import type { Product } from "@/lib/types";
import { AccessoryGroupCard } from "@/components/product/AccessoryGroupCard";
import { ProductCard } from "@/components/product/ProductCard";

/**
 * Like ProductGrid, but products sharing an accessory_group collapse into
 * one family tile instead of one card each (e.g. 5 Kunjalam designs -> one
 * "Kunjalam" tile). Products without a group render as normal cards
 * alongside the tiles.
 */
export function AccessoryGroupGrid({ products, categorySlug }: { products: Product[]; categorySlug: string }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-charcoal-soft">No products match these filters yet.</p>;
  }

  const groups = new Map<string, Product[]>();
  const standalone: Product[] = [];
  for (const product of products) {
    if (product.accessory_group) {
      const list = groups.get(product.accessory_group) ?? [];
      list.push(product);
      groups.set(product.accessory_group, list);
    } else {
      standalone.push(product);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from(groups.entries()).map(([groupName, groupProducts]) => (
        <AccessoryGroupCard key={groupName} groupName={groupName} products={groupProducts} categorySlug={categorySlug} />
      ))}
      {standalone.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
