"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils/format";
import { readLastOrder, type LastOrderSummary } from "@/lib/order-session";

export function OrderConfirmationContent() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [summary, setSummary] = useState<LastOrderSummary | null>(null);
  const [checked, setChecked] = useState(false);

  // sessionStorage doesn't exist during SSR, so this has to run client-side
  // after mount — same one-time-hydration reasoning as lib/cart-context.tsx.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from sessionStorage, see comment above
    setSummary(readLastOrder(orderNumber));
    setChecked(true);
  }, [orderNumber]);

  if (!checked) return null;

  return (
    <Container className="max-w-xl py-16 text-center sm:py-24">
      <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
      <h1 className="mt-6 font-display text-3xl text-charcoal">Thank You for Your Order</h1>
      <p className="mt-3 text-charcoal-soft">
        Order <span className="font-medium text-charcoal">#{orderNumber}</span> has been placed.
      </p>

      {summary ? (
        <div className="mt-8 rounded-2xl bg-cream p-6 text-left">
          <div className="flex justify-between text-sm text-charcoal-soft">
            <span>Items</span>
            <span>{summary.itemCount}</span>
          </div>
          <div className="mt-2 flex justify-between font-medium text-charcoal">
            <span>Total</span>
            <span>{formatINR(summary.total)}</span>
          </div>
          {/* PLACEHOLDER copy — update once Razorpay/payment collection is live. */}
          <p className="mt-4 text-xs text-taupe">
            Payment isn&apos;t collected online yet — our team will reach out to confirm payment
            and delivery details.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-charcoal-soft">
          We couldn&apos;t find this order&apos;s details in this browser, but if you just placed
          it, it went through successfully — keep your order number for reference.
        </p>
      )}

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href="/shop" size="lg">
          Continue Shopping
        </Button>
        <Button href="/" variant="outline" size="lg">
          Back to Home
        </Button>
      </div>
    </Container>
  );
}
