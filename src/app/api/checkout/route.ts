import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkoutPayloadSchema } from "@/lib/validation/checkout";
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayLiveMode } from "@/lib/payments/razorpay";
import { calculateShippingFee } from "@/lib/utils/shipping";

/**
 * Starts a payment: verifies price/stock and opens a matching Razorpay
 * order, but writes NOTHING to the database. The actual order (customer,
 * order, order_items, stock decrement) is only created in
 * /api/checkout/verify, and only once Razorpay's signature proves the
 * payment actually went through — so a failed, cancelled, or abandoned
 * payment never leaves an order behind or touches inventory.
 *
 * RAZORPAY_KEY_ID/SECRET are read from env — they're today's Test Mode
 * keys; swapping to Live Mode keys once the Razorpay account is verified is
 * an env var change, nothing here needs to change.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order details." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const supabase = getAdminClient();

  // Look up current price/stock for every requested product — the client's
  // cart is treated as a list of intents only. This is a pre-check so we
  // don't open a payment flow for something that's already unavailable; the
  // authoritative check happens again in /api/checkout/verify.
  const codes = data.items.map((item) => item.productCode);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("code, name, price_inr, stock_quantity, is_hidden")
    .in("code", codes);

  if (productsError) {
    return NextResponse.json({ error: "Could not verify products. Please try again." }, { status: 500 });
  }

  const productByCode = new Map((products ?? []).map((p) => [p.code, p]));
  let subtotal = 0;

  for (const item of data.items) {
    const product = productByCode.get(item.productCode);
    if (!product || product.is_hidden) {
      return NextResponse.json(
        { error: `${item.productCode} is no longer available.` },
        { status: 409 }
      );
    }
    if (product.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock_quantity} left of ${product.name}.` },
        { status: 409 }
      );
    }
    subtotal += product.price_inr * item.quantity;
  }

  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  // Recomputed here, never trusted from the client — same formula the
  // checkout page uses for its live estimate (lib/utils/shipping.ts), and
  // the same formula /api/checkout/verify uses again once payment succeeds.
  const shippingFee = calculateShippingFee({
    deliveryMethod: data.deliveryMethod,
    state: data.state ?? "",
    totalQuantity,
  });
  const total = subtotal + shippingFee;

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountInPaise: Math.round(total * 100),
      receipt: randomUUID(),
      notes: data.email ? { email: data.email } : undefined,
    });

    return NextResponse.json({
      total,
      razorpay: {
        orderId: razorpayOrder.id,
        keyId: getRazorpayKeyId(),
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        isLive: isRazorpayLiveMode(),
      },
    });
  } catch (error) {
    console.error("[checkout] Razorpay order creation failed", error);
    return NextResponse.json(
      { error: "Could not start payment right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
