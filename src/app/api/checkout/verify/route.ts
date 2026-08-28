import { NextResponse, after } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { razorpayVerifySchema } from "@/lib/validation/checkout";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { calculateShippingFee, PICKUP_ADDRESS } from "@/lib/utils/shipping";
import { sendTelegramOrderNotification } from "@/lib/payments/telegram";
import { formatINR } from "@/lib/utils/format";

interface ResolvedOrderItem {
  product_id: string;
  product_code: string;
  product_name: string;
  /** Present only for products sold with size/price options — see ProductPurchasePanel. */
  variant_id?: string;
  variant_label?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

/**
 * Confirms a Razorpay payment and, only once it's genuinely verified,
 * creates the order + order_items and decrements stock. /api/checkout never
 * wrote anything to the database, so a failed or abandoned payment simply
 * never reaches here — there's nothing to clean up.
 *
 * The HMAC signature (not the client's "success" callback) is what actually
 * proves Razorpay processed the payment: HMAC-SHA256(order_id + "|" +
 * payment_id, key_secret) must match what Razorpay handed back.
 *
 * Idempotent: if this fires twice for the same payment (client retry,
 * duplicate event), the second call finds the existing order by
 * payment_reference and returns it instead of creating a duplicate.
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payment confirmation." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const signatureValid = verifyRazorpaySignature({
    orderId: data.razorpayOrderId,
    paymentId: data.razorpayPaymentId,
    signature: data.razorpaySignature,
  });

  if (!signatureValid) {
    return NextResponse.json(
      { error: "We couldn't verify that payment. Please contact support with your order details." },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Already processed this exact payment (retry/duplicate webhook-style
  // call) — return the existing order instead of creating a second one.
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("order_number, total, status")
    .eq("payment_reference", data.razorpayPaymentId)
    .maybeSingle();

  if (existingOrder) {
    return NextResponse.json(existingOrder);
  }

  // Payment is verified — the money has moved, so from here on we record
  // the order no matter what. Stock is no longer a hard gate at this point
  // (that check already happened pre-payment in /api/checkout, to avoid
  // opening a payment flow for something already gone); quantity is just
  // floored at 0 below if something sold out in the meantime.
  const codes = data.items.map((item) => item.productCode);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, code, name, price_inr, stock_quantity, stock_group")
    .in("code", codes);

  if (productsError || !products) {
    console.error("[checkout/verify] Could not load products after payment", data.razorpayPaymentId, productsError);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't record your order. Please contact support with your payment id." },
      { status: 500 }
    );
  }

  const productByCode = new Map(products.map((p) => [p.code, p]));

  // Products sold with size/price options (see products.variants) are
  // priced and stocked per-variant, never off the product row itself.
  const productIds = products.map((p) => p.id);
  const { data: variants } = productIds.length
    ? await supabase.from("product_variants").select("id, product_id, label, price_inr, stock_quantity").in("product_id", productIds)
    : { data: [] };
  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));

  const orderItems: ResolvedOrderItem[] = [];

  for (const item of data.items) {
    const product = productByCode.get(item.productCode);
    if (!product) continue; // Shouldn't happen post-payment; skip rather than fail the whole order.

    const variant = item.variantId ? variantById.get(item.variantId) : undefined;
    const unitPrice = variant ? variant.price_inr : product.price_inr;

    orderItems.push({
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      variant_id: variant?.id,
      variant_label: variant?.label,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: unitPrice * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = calculateShippingFee({
    deliveryMethod: data.deliveryMethod,
    state: data.state ?? "",
    totalQuantity,
  });
  const total = subtotal + shippingFee;

  // Find-or-create the customer by email (guest checkout — no login). Email
  // is optional for local self-pickup, so only dedupe by email when one was
  // actually given.
  let customerId: string | undefined;
  if (data.email) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    customerId = existingCustomer?.id;
  }

  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({ name: data.name, email: data.email || null, phone: data.phone })
      .select("id")
      .single();
    if (customerError || !newCustomer) {
      console.error("[checkout/verify] Could not save customer after payment", data.razorpayPaymentId, customerError);
      return NextResponse.json(
        { error: "Payment succeeded but we couldn't save your details. Please contact support with your payment id." },
        { status: 500 }
      );
    }
    customerId = newCustomer.id;
  }

  // "local" orders are self-pickup — there's no customer address to store,
  // so the (not-null) shipping_* columns record our own pickup address instead.
  const isLocalPickup = data.deliveryMethod === "local";
  const shippingAddress = {
    line1: isLocalPickup ? PICKUP_ADDRESS.line1 : data.addressLine1!,
    line2: isLocalPickup ? PICKUP_ADDRESS.line2 : data.addressLine2 || null,
    city: isLocalPickup ? PICKUP_ADDRESS.city : data.city!,
    state: isLocalPickup ? PICKUP_ADDRESS.state : data.state!,
    pincode: isLocalPickup ? PICKUP_ADDRESS.pincode : data.pincode!,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      delivery_method: data.deliveryMethod,
      shipping_name: data.name,
      shipping_phone: data.phone,
      shipping_email: data.email || null,
      shipping_address_line1: shippingAddress.line1,
      shipping_address_line2: shippingAddress.line2,
      shipping_city: shippingAddress.city,
      shipping_state: shippingAddress.state,
      shipping_pincode: shippingAddress.pincode,
      subtotal,
      shipping_fee: shippingFee,
      total,
      notes: data.notes || null,
      status: "confirmed",
      payment_status: "paid",
      payment_reference: data.razorpayPaymentId,
    })
    .select("id, order_number, total, status")
    .single();

  if (orderError || !order) {
    console.error("[checkout/verify] Could not create order after payment", data.razorpayPaymentId, orderError);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't create your order. Please contact support with your payment id." },
      { status: 500 }
    );
  }

  // variant_id is only used below for stock bookkeeping — order_items has no
  // such column, it only stores the variant_label snapshot.
  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit it from the insert payload
      const { variant_id, ...rest } = item;
      return { ...rest, order_id: order.id };
    })
  );

  if (itemsError) {
    // The order itself is already saved with a real order_number — log loudly
    // rather than failing the customer's confirmation over a line-items write.
    console.error("[checkout/verify] Could not save order_items for", order.order_number, itemsError);
  }

  // Products sold with size/price options decrement that specific variant's
  // own stock — variants don't participate in stock_group pooling, each has
  // an independent count.
  const soldByVariant = new Map<string, number>(); // variant_id -> qty sold in this order
  // Some product codes share one physical stock pool (see products.stock_group)
  // — e.g. codes 210 and 204 are the same inventory listed twice. Buying
  // either must decrement every code in the group together, or the two
  // listings drift apart from what's actually left in the stockroom.
  const soldByGroup = new Map<string, number>(); // stock_group -> total qty sold in this order
  const soldBySingleCode = new Map<string, number>(); // product_code -> qty, for ungrouped products
  for (const item of orderItems) {
    if (item.variant_id) {
      soldByVariant.set(item.variant_id, (soldByVariant.get(item.variant_id) ?? 0) + item.quantity);
      continue;
    }
    const product = productByCode.get(item.product_code)!;
    if (product.stock_group) {
      soldByGroup.set(product.stock_group, (soldByGroup.get(product.stock_group) ?? 0) + item.quantity);
    } else {
      soldBySingleCode.set(item.product_code, (soldBySingleCode.get(item.product_code) ?? 0) + item.quantity);
    }
  }

  for (const [variantId, qtySold] of soldByVariant) {
    const variant = variantById.get(variantId);
    if (!variant) continue;
    await supabase
      .from("product_variants")
      .update({ stock_quantity: Math.max(variant.stock_quantity - qtySold, 0) })
      .eq("id", variantId);
  }

  if (soldByGroup.size > 0) {
    const { data: groupedProducts } = await supabase
      .from("products")
      .select("stock_group, stock_quantity")
      .in("stock_group", Array.from(soldByGroup.keys()));

    for (const [group, qtySold] of soldByGroup) {
      const members = (groupedProducts ?? []).filter((p) => p.stock_group === group);
      if (members.length === 0) continue;
      // Every member of a group is meant to hold the same stock_quantity;
      // take the minimum in case of manual-edit drift, so we never oversell.
      const currentShared = Math.min(...members.map((m) => m.stock_quantity));
      const newShared = Math.max(currentShared - qtySold, 0);
      await supabase.from("products").update({ stock_quantity: newShared }).eq("stock_group", group);
    }
  }

  for (const [productCode, qty] of soldBySingleCode) {
    const product = productByCode.get(productCode)!;
    await supabase
      .from("products")
      .update({ stock_quantity: Math.max(product.stock_quantity - qty, 0) })
      .eq("id", product.id);
  }

  const fullAddress = [
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // Best-effort — never blocks the customer's confirmation on Telegram being
  // reachable. Scheduled via after() rather than a bare `void` call: on
  // serverless platforms (Vercel), the function can be frozen/torn down the
  // instant the response below is sent, killing any still-in-flight fetch
  // that wasn't explicitly kept alive. after() (backed by Vercel's
  // waitUntil) keeps this invocation alive just long enough for the
  // Telegram request to finish, without delaying the response itself.
  after(() =>
    sendTelegramOrderNotification(
      buildTelegramMessage({
        orderNumber: order.order_number,
        customerName: data.name,
        phone: data.phone,
        fullAddress,
        deliveryMethod: data.deliveryMethod,
        items: orderItems,
        total: order.total,
        notes: data.notes,
      })
    )
  );

  return NextResponse.json({ orderNumber: order.order_number, total: order.total, status: order.status });
}

function buildTelegramMessage(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  fullAddress: string;
  deliveryMethod: string;
  items: ResolvedOrderItem[];
  total: number;
  notes?: string;
}): string {
  const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const itemLines = params.items
    .map((item) => {
      const variantSuffix = item.variant_label ? ` (${esc(item.variant_label)})` : "";
      return `• ${esc(item.product_name)}${variantSuffix} (#${item.product_code}) × ${item.quantity} — ${formatINR(item.line_total)}`;
    })
    .join("\n");

  const lines = [
    `🛍️ <b>New Order ${esc(params.orderNumber)}</b>`,
    ``,
    `<b>Customer:</b> ${esc(params.customerName)}`,
    `<b>Phone:</b> ${esc(params.phone)}`,
    `<b>${params.deliveryMethod === "local" ? "Pickup" : "Delivery"} Address:</b> ${esc(params.fullAddress)}`,
    ``,
    `<b>Order:</b>`,
    itemLines,
    ``,
    `<b>Total:</b> ${formatINR(params.total)}`,
  ];

  if (params.notes) {
    lines.push(``, `<b>Notes:</b> ${esc(params.notes)}`);
  }

  return lines.join("\n");
}
