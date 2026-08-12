import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkoutPayloadSchema } from "@/lib/validation/checkout";

/**
 * Creates a guest order: find-or-create the customer, verify price/stock
 * server-side (never trust the client's cart), insert the order + items,
 * then decrement stock. No payment gateway call yet — orders are created
 * with status "pending_payment" so Razorpay can be wired in later without
 * changing this shape (see payment_provider/payment_status/payment_reference
 * on the orders table).
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
  const shippingFee = 0; // TODO: Razorpay + shipping-rules integration. Flat/free for now.
  const total = subtotal + shippingFee;

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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      shipping_name: data.name,
      shipping_phone: data.phone,
      shipping_email: data.email,
      shipping_address_line1: data.addressLine1,
      shipping_address_line2: data.addressLine2 || null,
      shipping_city: data.city,
      shipping_state: data.state,
      shipping_pincode: data.pincode,
      subtotal,
      shipping_fee: shippingFee,
      total,
      notes: data.notes || null,
      // status / payment_status / payment_provider all use their column
      // defaults (pending_payment / pending / razorpay) until checkout is live.
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
  });
}
