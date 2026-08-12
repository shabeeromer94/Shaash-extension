import type { Metadata } from "next";
import { OrderConfirmationContent } from "@/components/checkout/OrderConfirmationContent";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationContent />;
}
