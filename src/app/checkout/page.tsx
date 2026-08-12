import type { Metadata } from "next";
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to complete your SHAASH Beauty Store order.",
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
