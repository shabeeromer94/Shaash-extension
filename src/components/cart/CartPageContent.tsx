"use client";

import { useCart } from "@/lib/cart-context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";

export function CartPageContent() {
  const { items } = useCart();

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionHeading align="left" eyebrow="Your Bag" title="Shopping Cart" className="mb-10" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-charcoal-soft">Your cart is empty.</p>
            <Button href="/shop">Shop Hair Extensions</Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              {items.map((item) => (
                <CartLineItem key={`${item.productCode}::${item.variantId ?? ""}`} item={item} />
              ))}
            </div>
            <CartSummary />
          </div>
        )}
      </Container>
    </div>
  );
}
