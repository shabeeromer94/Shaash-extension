import { z } from "zod";

/** Client-side form schema — matches the fields on the checkout page. */
export const checkoutFormSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15, "Phone number is too long"),
  addressLine1: z.string().min(5, "Enter your delivery address"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  pincode: z.string().min(4, "Enter a valid PIN code").max(10, "PIN code is too long"),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** Server-side payload schema — the form fields plus the cart contents. */
export const checkoutPayloadSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        productCode: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutPayloadInput = z.infer<typeof checkoutPayloadSchema>;
