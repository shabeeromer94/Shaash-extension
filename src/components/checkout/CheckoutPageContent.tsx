"use client";

import { useCart } from "@/lib/cart-context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export function CheckoutPageContent() {
  const { items } = useCart();

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <SectionHeading align="left" eyebrow="Checkout" title="Delivery Details" className="mb-10" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-charcoal-soft">Your cart is empty. Add a product before checking out.</p>
            <Button href="/shop">Shop Hair Extensions</Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <CheckoutForm />
            <OrderSummary />
          </div>
        )}
      </Container>
    </div>
  );
}
