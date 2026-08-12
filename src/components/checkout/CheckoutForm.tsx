"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { saveLastOrder } from "@/lib/order-session";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CheckoutForm() {
  const { items, totalItems, clearCart } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

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
        return;
      }

      saveLastOrder({
        orderNumber: result.orderNumber,
        total: result.total,
        status: result.status,
        itemCount: totalItems,
      });
      clearCart();
      router.push(`/checkout/confirmation/${result.orderNumber}`);
    } catch {
      setSubmitError("Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
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

      <Input
        label="Address Line 1"
        autoComplete="address-line1"
        {...register("addressLine1")}
        error={errors.addressLine1?.message}
      />
      <Input label="Address Line 2 (optional)" autoComplete="address-line2" {...register("addressLine2")} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input label="City" autoComplete="address-level2" {...register("city")} error={errors.city?.message} />
        <Input label="State" autoComplete="address-level1" {...register("state")} error={errors.state?.message} />
        <Input
          label="PIN Code"
          autoComplete="postal-code"
          {...register("pincode")}
          error={errors.pincode?.message}
        />
      </div>

      <Textarea
        label="Order Notes (optional)"
        placeholder="Delivery instructions, gift note, etc."
        {...register("notes")}
      />

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      {/* PLACEHOLDER copy — update once Razorpay is actually wired up. */}
      <div className="rounded-xl bg-beige/50 px-4 py-3 text-sm text-charcoal-soft">
        Online payment isn&apos;t live yet — placing an order reserves your items, and our team
        will follow up to confirm payment and delivery.
      </div>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
