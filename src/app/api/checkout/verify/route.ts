import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { razorpayVerifySchema } from "@/lib/validation/checkout";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";

/**
 * Confirms a Razorpay payment against the order it belongs to, once Checkout's
 * `handler` fires client-side after a successful payment.
 *
 * Two checks, both required:
 *  1. `payment_reference` on the order must match the `razorpayOrderId` sent
 *     here — stops someone replaying a valid signature from an unrelated
 *     (e.g. their own, smaller) payment against a different order number.
 *  2. The HMAC signature must verify against RAZORPAY_KEY_SECRET — this is
 *     what actually proves Razorpay processed the payment; the client's
 *     "success" callback alone proves nothing.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = razorpayVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment confirmation." }, { status: 400 });
  }
  const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const supabase = getAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, total, status, payment_status, payment_reference")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_reference !== razorpayOrderId) {
    return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
  }

  // Duplicate callback (e.g. a retried request) — already confirmed, nothing to redo.
  if (order.payment_status === "paid") {
    return NextResponse.json({ orderNumber: order.order_number, total: order.total, status: order.status });
  }

  const signatureValid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!signatureValid) {
    return NextResponse.json(
      { error: "We couldn't verify that payment. Please contact support with your order number." },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_reference: razorpayPaymentId,
    })
    .eq("id", order.id)
    .select("order_number, total, status")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't update your order. Please contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ orderNumber: updated.order_number, total: updated.total, status: updated.status });
}
