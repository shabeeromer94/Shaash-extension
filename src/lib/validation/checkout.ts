import { z } from "zod";
import type { DeliveryMethod } from "@/lib/utils/shipping";

/**
 * Address fields are optional at the schema-shape level and conditionally
 * required by requireCourierAddress below — "local" (within Chennai) orders
 * are self-pickup, so no delivery address is collected for them. Keeping the
 * shape flat (rather than a discriminated union) keeps react-hook-form's
 * `register()` typing simple, since every field name is always valid.
 */
const baseCheckoutFields = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15, "Phone number is too long"),
  deliveryMethod: z.enum(["local", "courier"]),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
});

function requireCourierAddress(
  data: {
    deliveryMethod: DeliveryMethod;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  },
  ctx: z.RefinementCtx
) {
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
export const checkoutFormSchema = baseCheckoutFields.superRefine(requireCourierAddress);

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** Server-side payload schema — the form fields plus the cart contents. */
export const checkoutPayloadSchema = baseCheckoutFields
  .extend({
    items: z
      .array(
        z.object({
          productCode: z.string().min(1),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, "Your cart is empty."),
  })
  .superRefine(requireCourierAddress);

export type CheckoutPayloadInput = z.infer<typeof checkoutPayloadSchema>;

/** What the client sends back after Razorpay Checkout's `handler` fires on a successful payment. */
export const razorpayVerifySchema = z.object({
  orderNumber: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type RazorpayVerifyInput = z.infer<typeof razorpayVerifySchema>;
