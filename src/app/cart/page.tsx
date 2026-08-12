import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your SHAASH Beauty Store cart before checkout.",
};

export default function CartPage() {
  return <CartPageContent />;
}
