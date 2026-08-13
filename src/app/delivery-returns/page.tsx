import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Delivery & Return Policy",
  description:
    "Delivery timelines across India and our return/replacement policy for SHAASH Beauty Store hair extensions.",
};

export default function DeliveryReturnsPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Policies" title="Delivery &amp; Return Policy" align="left" />

        <div className="mt-14 flex flex-col gap-16">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl text-charcoal">Delivery</h2>
            <p className="leading-relaxed text-charcoal-soft">We ship our hair extensions across India.</p>

            <ul className="flex flex-col gap-3 leading-relaxed text-charcoal-soft">
              <li>
                <strong className="text-charcoal">Chennai</strong> — Same-day / next-day delivery may be
                available through local delivery partners, depending on location and order timing.
              </li>
              <li>
                <strong className="text-charcoal">Within Tamil Nadu</strong> — Usually 2–3 business days.
              </li>
              <li>
                <strong className="text-charcoal">Outside Tamil Nadu</strong> — Usually 3–5 business days,
                depending on the destination and courier service.
              </li>
            </ul>

            <p className="leading-relaxed text-charcoal-soft">
              Orders are dispatched after payment confirmation. Delivery timelines may vary slightly due to
              courier delays, weekends, holidays, or unforeseen circumstances.
            </p>
            <p className="leading-relaxed text-charcoal-soft">
              Once your order is dispatched, we will share the relevant shipping details with you.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl text-charcoal">Return &amp; Replacement Policy</h2>
            <p className="leading-relaxed text-charcoal-soft">
              Because our hair extensions are personal-use products, we follow strict hygiene standards.
            </p>
            <p className="leading-relaxed text-charcoal-soft">
              Therefore, we do not accept returns or exchanges for change of mind, colour preference, style
              preference, or if the product does not suit your hairstyle.
            </p>
            <p className="leading-relaxed text-charcoal-soft">
              However, if you receive a damaged product or an incorrect product, you can raise a
              return/replacement claim.
            </p>

            <div className="flex flex-col gap-3">
              <p className="font-medium text-charcoal">For any claim:</p>
              <ul className="flex flex-col gap-3 leading-relaxed text-charcoal-soft">
                <li>Record a continuous unboxing video from the moment you open the package.</li>
                <li>Make sure the product and packaging are clearly visible.</li>
                <li>Send us the unboxing video along with your order details.</li>
                <li>Our team will review the claim and assist you with the next steps.</li>
              </ul>
            </div>

            <p className="rounded-xl bg-beige/50 px-4 py-3 text-sm text-charcoal-soft">
              Claims without proper unboxing video proof may not be eligible for a return or replacement.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
