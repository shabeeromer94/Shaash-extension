"use client";

import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils/format";

export function CartSummary() {
  const { subtotal, totalItems } = useCart();

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-cream p-6">
      <h2 className="font-display text-lg text-charcoal">Order Summary</h2>

      <div className="flex justify-between text-sm text-charcoal-soft">
        <span>
          Subtotal ({totalItems} item{totalItems === 1 ? "" : "s"})
        </span>
        <span>{formatINR(subtotal)}</span>
      </div>
      <p className="text-xs text-taupe">Shipping is calculated at checkout.</p>

      <div className="flex items-center justify-between border-t border-line pt-4 font-medium text-charcoal">
        <span>Total</span>
        <span>{formatINR(subtotal)}</span>
      </div>

      {totalItems === 0 ? (
        <Button size="lg" disabled>
          Proceed to Checkout
        </Button>
      ) : (
        <Button href="/checkout" size="lg">
          Proceed to Checkout
        </Button>
      )}
      <Button href="/shop" variant="ghost">
        Continue Shopping
      </Button>
    </div>
  );
}
