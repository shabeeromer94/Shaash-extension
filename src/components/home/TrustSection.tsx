import { BadgeCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";

// PLACEHOLDER — confirm actual shipping/returns/payment details before launch.
const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Secure Ordering" },
  { icon: Truck, label: "Pan-India Shipping" },
  { icon: BadgeCheck, label: "Quality Checked" },
  { icon: MessageCircle, label: "Real Customer Support" },
];

export function TrustSection() {
  return (
    <section className="border-y border-line bg-cream py-10">
      <Container className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {TRUST_POINTS.map((point) => (
          <div key={point.label} className="flex flex-col items-center gap-2 text-center">
            <point.icon className="h-5 w-5 text-gold" />
            <p className="text-xs font-medium uppercase tracking-label text-charcoal-soft">{point.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
