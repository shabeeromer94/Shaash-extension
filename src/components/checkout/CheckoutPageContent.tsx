"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { DeliveryMethod } from "@/lib/utils/shipping";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export function CheckoutPageContent({ isLiveMode = false }: { isLiveMode?: boolean }) {
  const { items } = useCart();
  // Lifted out of CheckoutForm so OrderSummary (a sibling column) can show a
  // live shipping estimate that matches what the form is about to submit.
  const [summary, setSummary] = useState<{ deliveryMethod: DeliveryMethod; shippingFee: number }>({
    deliveryMethod: "courier",
    shippingFee: 0,
  });

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
            <CheckoutForm onSummaryChange={setSummary} isLiveMode={isLiveMode} />
            <OrderSummary deliveryMethod={summary.deliveryMethod} shippingFee={summary.shippingFee} />
          </div>
        )}
      </Container>
    </div>
  );
}
