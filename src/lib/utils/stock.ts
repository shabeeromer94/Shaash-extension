import type { AvailabilityStatus, Product } from "@/lib/types";

/**
 * Availability is derived from stock_quantity / low_stock_threshold / is_hidden
 * rather than stored as its own column, so it can never drift out of sync with
 * the actual stock count.
 */
export function getAvailability(
  product: Pick<Product, "stock_quantity" | "low_stock_threshold" | "is_hidden">
): AvailabilityStatus {
  if (product.is_hidden) return "hidden";
  if (product.stock_quantity <= 0) return "out_of_stock";
  if (product.stock_quantity <= product.low_stock_threshold) return "low_stock";
  return "in_stock";
}

/** Whether "Add to Cart" / "Buy Now" should ever be shown for this product. */
export function isPurchasable(
  product: Pick<Product, "stock_quantity" | "low_stock_threshold" | "is_hidden">
): boolean {
  const status = getAvailability(product);
  return status === "in_stock" || status === "low_stock";
}

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  hidden: "Unavailable",
};
