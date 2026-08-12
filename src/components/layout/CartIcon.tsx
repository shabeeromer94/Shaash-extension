"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartIcon() {
  const { totalItems } = useCart();
  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-beige/60"
      aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-ivory">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
