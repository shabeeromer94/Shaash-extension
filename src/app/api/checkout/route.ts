import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkoutPayloadSchema } from "@/lib/validation/checkout";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { calculateShippingFee, PICKUP_ADDRESS } from "@/lib/utils/shipping";

/**
 * Creates a guest order: find-or-create the customer, verify price/stock
 * server-side (never trust the client's cart), open a matching Razorpay
 * order, then insert the order + items and decrement stock. The order row
 * is written with status "pending_payment" / payment_status "pending" and
 * only flips to "confirmed" / "paid" once /api/checkout/verify checks the
 * signature Razorpay hands back after the customer actually pays.
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
  // cart is treated as a list of intents only.
  const codes = data.items.map((item) => item.productCode);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, code, name, price_inr, stock_quantity, is_hidden")
    .in("code", codes);

  if (productsError) {
    return NextResponse.json({ error: "Could not verify products. Please try again." }, { status: 500 });
  }

  const productByCode = new Map((products ?? []).map((p) => [p.code, p]));

  const orderItems: {
    product_id: string;
    product_code: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

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
    orderItems.push({
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      unit_price: product.price_inr,
      quantity: item.quantity,
      line_total: product.price_inr * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  // Recomputed here, never trusted from the client — same formula the
  // checkout page uses for its live estimate (lib/utils/shipping.ts).
  const shippingFee = calculateShippingFee({
    deliveryMethod: data.deliveryMethod,
    state: data.state ?? "",
    totalQuantity,
  });
  const total = subtotal + shippingFee;

  // Open the Razorpay order before writing anything — if Razorpay is
  // unreachable or misconfigured, fail here with no half-created order left behind.
  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amountInPaise: Math.round(total * 100),
      receipt: randomUUID(),
      notes: { email: data.email },
    });
  } catch (error) {
    console.error("[checkout] Razorpay order creation failed", error);
    return NextResponse.json(
      { error: "Could not start payment right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  // Find-or-create the customer by email (guest checkout — no login).
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  let customerId = existingCustomer?.id as string | undefined;
  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({ name: data.name, email: data.email, phone: data.phone })
      .select("id")
      .single();
    if (customerError || !newCustomer) {
      return NextResponse.json({ error: "Could not save your details. Please try again." }, { status: 500 });
    }
    customerId = newCustomer.id;
  }

  // "local" orders are self-pickup — there's no customer address to store,
  // so the (not-null) shipping_* columns record our own pickup address instead.
  const isLocalPickup = data.deliveryMethod === "local";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      delivery_method: data.deliveryMethod,
      shipping_name: data.name,
      shipping_phone: data.phone,
      shipping_email: data.email,
      shipping_address_line1: isLocalPickup ? PICKUP_ADDRESS.line1 : data.addressLine1!,
      shipping_address_line2: isLocalPickup ? PICKUP_ADDRESS.line2 : data.addressLine2 || null,
      shipping_city: isLocalPickup ? PICKUP_ADDRESS.city : data.city!,
      shipping_state: isLocalPickup ? PICKUP_ADDRESS.state : data.state!,
      shipping_pincode: isLocalPickup ? PICKUP_ADDRESS.pincode : data.pincode!,
      subtotal,
      shipping_fee: shippingFee,
      total,
      notes: data.notes || null,
      payment_reference: razorpayOrder.id,
      // status / payment_status / payment_provider all use their column
      // defaults (pending_payment / pending / razorpay) — flipped to
      // confirmed/paid by /api/checkout/verify once payment is confirmed.
    })
    .select("id, order_number, total, status")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: "Could not save order items. Please try again." }, { status: 500 });
  }

  // Decrement stock per item. Sequential updates are fine at this catalog
  // size; if concurrent order volume grows, move this to a single Postgres
  // function (supabase.rpc) so it's atomic with the checks above.
  for (const item of orderItems) {
    const product = productByCode.get(item.product_code)!;
    await supabase
      .from("products")
      .update({ stock_quantity: Math.max(product.stock_quantity - item.quantity, 0) })
      .eq("id", item.product_id);
  }

  return NextResponse.json({
    orderNumber: order.order_number,
    total: order.total,
    status: order.status,
    razorpay: {
      orderId: razorpayOrder.id,
      keyId: getRazorpayKeyId(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
}
