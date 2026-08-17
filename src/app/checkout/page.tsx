import type { Metadata } from "next";
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";
import { isRazorpayLiveMode } from "@/lib/payments/razorpay";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to complete your SHAASH Beauty Store order.",
};

export default function CheckoutPage() {
  // Computed server-side from RAZORPAY_KEY_ID so the "test mode" messaging
  // is never stale — it reflects whatever key is actually configured now.
  let isLiveMode = false;
  try {
    isLiveMode = isRazorpayLiveMode();
  } catch {
    // Razorpay isn't configured yet — checkout will surface its own error on submit.
  }

  return <CheckoutPageContent isLiveMode={isLiveMode} />;
}
