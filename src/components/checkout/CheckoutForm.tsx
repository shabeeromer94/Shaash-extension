"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { saveLastOrder } from "@/lib/order-session";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { calculateShippingFee, PICKUP_ADDRESS, type DeliveryMethod } from "@/lib/utils/shipping";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/payments/razorpay-checkout";
import { cn } from "@/lib/utils/cn";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PendingPayment {
  orderNumber: string;
  total: number;
  itemCount: number;
  razorpay: { orderId: string; keyId: string; amount: number; currency: string };
}

export function CheckoutForm({
  onSummaryChange,
}: {
  /** Fires on every relevant change so OrderSummary (a sibling) can show a live shipping estimate. */
  onSummaryChange?: (summary: { deliveryMethod: DeliveryMethod; shippingFee: number }) => void;
}) {
  const { items, totalItems, clearCart } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set once /api/checkout has created the order + Razorpay order. From here
  // on, a dismissed/failed payment retries against this SAME order — it never
  // resubmits the form, which would create a second order and double-decrement stock.
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { deliveryMethod: "courier" },
  });

  // useWatch (a proper hook), not form.watch() — React Compiler can memoize this safely.
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" }) ?? "courier";
  const stateValue = useWatch({ control, name: "state" });

  // Live estimate only — the actual charge is always recomputed server-side
  // in /api/checkout from this same formula (lib/utils/shipping.ts).
  useEffect(() => {
    onSummaryChange?.({
      deliveryMethod,
      shippingFee: calculateShippingFee({ deliveryMethod, state: stateValue ?? "", totalQuantity: totalItems }),
    });
  }, [deliveryMethod, stateValue, totalItems, onSummaryChange]);

  async function verifyAndFinish(response: RazorpaySuccessResponse, pending: PendingPayment) {
    try {
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: pending.orderNumber,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });
      const result = await verifyRes.json();

      if (!verifyRes.ok) {
        setSubmitError(result.error ?? "We couldn't confirm your payment. Please try again.");
        setSubmitting(false);
        return;
      }

      saveLastOrder({
        orderNumber: result.orderNumber,
        total: result.total,
        status: result.status,
        itemCount: pending.itemCount,
      });
      clearCart();
      router.push(`/checkout/confirmation/${result.orderNumber}`);
    } catch {
      setSubmitError("We couldn't confirm your payment. Please try again.");
      setSubmitting(false);
    }
  }

  function launchPayment(pending: PendingPayment, prefill: { name: string; email: string; phone: string }) {
    setSubmitError(null);
    setSubmitting(true);
    openRazorpayCheckout({
      key: pending.razorpay.keyId,
      amount: pending.razorpay.amount,
      currency: pending.razorpay.currency,
      name: "SHAASH Beauty Store",
      description: `Order ${pending.orderNumber}`,
      order_id: pending.razorpay.orderId,
      prefill: { name: prefill.name, email: prefill.email, contact: prefill.phone },
      theme: { color: "#2a231d" },
      handler: (response) => verifyAndFinish(response, pending),
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          setSubmitError("Payment window closed before completing — your order is saved, you can retry below.");
        },
      },
    }).then((instance) => {
      if (!instance) {
        setSubmitting(false);
        setSubmitError("Could not open the payment window. Please check your connection and try again.");
      }
    });
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({ productCode: item.productCode, quantity: item.quantity })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "Something went wrong placing your order. Please try again.");
        setSubmitting(false);
        return;
      }

      const pending: PendingPayment = {
        orderNumber: result.orderNumber,
        total: result.total,
        itemCount: totalItems,
        razorpay: result.razorpay,
      };
      setPendingPayment(pending);
      launchPayment(pending, values);
    } catch {
      setSubmitError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
    }
  };

  const retryPayment = () => {
    if (!pendingPayment) return;
    const values = getValues();
    launchPayment(pendingPayment, values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      <fieldset disabled={!!pendingPayment} className="flex flex-col gap-3 disabled:opacity-60">
        <h3 className="font-display text-lg text-charcoal">Delivery Method</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-4 transition-colors",
              deliveryMethod === "local" ? "border-charcoal bg-cream" : "border-line hover:border-taupe/60"
            )}
          >
            <input type="radio" value="local" className="sr-only" {...register("deliveryMethod")} />
            <p className="font-medium text-charcoal">Local Delivery</p>
            <p className="mt-1 text-sm text-charcoal-soft">
              Within Chennai — self-pickup via your own Rapido/Porter, free
            </p>
          </label>
          <label
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-4 transition-colors",
              deliveryMethod === "courier" ? "border-charcoal bg-cream" : "border-line hover:border-taupe/60"
            )}
          >
            <input type="radio" value="courier" className="sr-only" {...register("deliveryMethod")} />
            <p className="font-medium text-charcoal">Courier</p>
            <p className="mt-1 text-sm text-charcoal-soft">Pan-India shipping — charges calculated below</p>
          </label>
        </div>

        {deliveryMethod === "local" ? (
          <div className="rounded-xl bg-cream p-4 text-sm text-charcoal-soft">
            <p className="font-medium text-charcoal">Pickup address</p>
            <p className="mt-1">{PICKUP_ADDRESS.line1}</p>
            <p>
              {PICKUP_ADDRESS.line2}, {PICKUP_ADDRESS.city}, {PICKUP_ADDRESS.state} {PICKUP_ADDRESS.pincode}
            </p>
            <p className="mt-2 text-xs text-taupe">
              Arrange your own Rapido/Porter rider (or collect in person) once we confirm your order — no delivery
              charge.
            </p>
          </div>
        ) : (
          <p className="text-xs text-taupe">
            ₹120 base fare within Tamil Nadu (₹140 outside), plus ₹10 per additional item — calculated from the
            state you enter below.
          </p>
        )}
      </fieldset>

      <fieldset disabled={!!pendingPayment} className="flex flex-col gap-5 disabled:opacity-60">
        <h3 className="font-display text-lg text-charcoal">Delivery Details</h3>
        <Input label="Full Name" autoComplete="name" {...register("name")} error={errors.name?.message} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>

        {deliveryMethod === "courier" && (
          <>
            <Input
              label="Address Line 1"
              autoComplete="address-line1"
              {...register("addressLine1")}
              error={errors.addressLine1?.message}
            />
            <Input label="Address Line 2 (optional)" autoComplete="address-line2" {...register("addressLine2")} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                label="City"
                autoComplete="address-level2"
                {...register("city")}
                error={errors.city?.message}
              />
              <Input
                label="State"
                autoComplete="address-level1"
                {...register("state")}
                error={errors.state?.message}
              />
              <Input
                label="PIN Code"
                autoComplete="postal-code"
                {...register("pincode")}
                error={errors.pincode?.message}
              />
            </div>
          </>
        )}

        <Textarea
          label="Order Notes (optional)"
          placeholder="Delivery instructions, gift note, etc."
          {...register("notes")}
        />
      </fieldset>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="rounded-xl bg-beige/50 px-4 py-3 text-sm text-charcoal-soft">
        Payment is handled securely by Razorpay (test mode) — no live charge is made yet.
      </div>

      {pendingPayment ? (
        <Button type="button" size="lg" onClick={retryPayment} disabled={submitting}>
          {submitting ? "Opening Payment..." : `Retry Payment — Order #${pendingPayment.orderNumber}`}
        </Button>
      ) : (
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order & Pay"}
        </Button>
      )}
    </form>
  );
}
