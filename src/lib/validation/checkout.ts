import { z } from "zod";
import type { DeliveryMethod } from "@/lib/utils/shipping";

/**
 * Address fields are optional at the schema-shape level and conditionally
 * required by validateCheckoutFields below — "local" (within Chennai) orders
 * are self-pickup, so no delivery address is collected for them. Email is
 * required for courier orders (used for shipping confirmation) but optional
 * for local pickup — if one is given, it still has to be a valid address.
 * Keeping the shape flat (rather than a discriminated union) keeps
 * react-hook-form's `register()` typing simple, since every field name is
 * always valid.
 */
const baseCheckoutFields = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().optional(),
  phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15, "Phone number is too long"),
  deliveryMethod: z.enum(["local", "courier"]),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

/** Base fields + cart contents — the shape shared by /api/checkout and /api/checkout/verify. */
const checkoutPayloadShape = baseCheckoutFields.extend({
  items: z
    .array(
      z.object({
        productCode: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty."),
});

const EMAIL_SHAPE = z.string().email();

function validateCheckoutFields(
  data: {
    deliveryMethod: DeliveryMethod;
    email?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  },
  ctx: z.RefinementCtx
) {
  if (data.deliveryMethod === "courier" && !data.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Enter your email address" });
  } else if (data.email && !EMAIL_SHAPE.safeParse(data.email).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Enter a valid email address" });
  }

  if (data.deliveryMethod !== "courier") return;
  if (!data.addressLine1 || data.addressLine1.length < 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["addressLine1"], message: "Enter your delivery address" });
  }
  if (!data.city || data.city.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "Enter your city" });
  }
  if (!data.state || data.state.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["state"], message: "Enter your state" });
  }
  if (!data.pincode || data.pincode.length < 4 || data.pincode.length > 10) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pincode"], message: "Enter a valid PIN code" });
  }
}

/** Client-side form schema — matches the fields on the checkout page. */
export const checkoutFormSchema = baseCheckoutFields.superRefine(validateCheckoutFields);

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** /api/checkout payload — starts a Razorpay payment. Writes nothing to the database. */
export const checkoutPayloadSchema = checkoutPayloadShape.superRefine(validateCheckoutFields);

export type CheckoutPayloadInput = z.infer<typeof checkoutPayloadSchema>;

/**
 * /api/checkout/verify payload — the same checkout fields + cart resent
 * alongside what Razorpay Checkout's `handler` hands back on a successful
 * payment. Resending the full form (rather than just an order id) is what
 * lets the order be created here, for the first time, only once payment is
 * actually confirmed — see /api/checkout/verify for why.
 */
export const razorpayVerifySchema = checkoutPayloadShape
  .extend({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  })
  .superRefine(validateCheckoutFields);

export type RazorpayVerifyInput = z.infer<typeof razorpayVerifySchema>;
