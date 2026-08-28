"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/utils/format";
import type { DeliveryMethod } from "@/lib/utils/shipping";

export function OrderSummary({
  deliveryMethod = "courier",
  shippingFee = 0,
}: {
  deliveryMethod?: DeliveryMethod;
  shippingFee?: number;
}) {
  const { items, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-sm text-charcoal-soft">Your cart is empty — add a product before checking out.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-cream p-6">
      <h2 className="font-display text-lg text-charcoal">Order Summary</h2>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={`${item.productCode}::${item.variantId ?? ""}`} className="flex items-center gap-3">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-beige/40">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{item.name}</p>
              <p className="text-xs text-taupe">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-charcoal">{formatINR(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm text-charcoal-soft">
        <div className="flex justify-between">
          <span>
            Subtotal ({totalItems} item{totalItems === 1 ? "" : "s"})
          </span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping{deliveryMethod === "local" && " (self-pickup)"}</span>
          <span>{shippingFee === 0 ? "Free" : formatINR(shippingFee)}</span>
        </div>
      </div>
      <div className="flex justify-between font-medium text-charcoal">
        <span>Total</span>
        <span>{formatINR(subtotal + shippingFee)}</span>
      </div>
    </div>
  );
}
