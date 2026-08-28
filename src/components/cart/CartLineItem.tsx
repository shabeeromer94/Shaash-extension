"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { formatINR } from "@/lib/utils/format";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-line py-6 first:pt-0">
      <Link
        href={`/products/${item.productCode}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-beige/40 sm:h-28 sm:w-24"
      >
        {item.image && <Image src={item.image} alt={item.name} fill sizes="100px" className="object-cover" />}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-label text-taupe">#{item.productCode}</p>
            <Link
              href={`/products/${item.productCode}`}
              className="font-display text-base text-charcoal hover:underline"
            >
              {item.name}
            </Link>
            {item.variantLabel && <p className="mt-0.5 text-sm text-charcoal-soft">Size: {item.variantLabel}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productCode, item.variantId)}
            aria-label={`Remove ${item.name}`}
            className="text-taupe hover:text-charcoal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex h-10 items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => updateQuantity(item.productCode, item.quantity - 1, item.variantId)}
              className="flex h-full w-9 items-center justify-center text-charcoal"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productCode, item.quantity + 1, item.variantId)}
              className="flex h-full w-9 items-center justify-center text-charcoal disabled:opacity-40"
              aria-label="Increase quantity"
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="font-medium text-charcoal">{formatINR(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
