import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About SHAASH Beauty Store",
  description: "The story behind SHAASH Beauty Store and our approach to premium hair extensions.",
};

// PLACEHOLDER copy throughout — replace every bracketed line with the real
// brand story, founder background and product philosophy before launch.
export default function AboutPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="About" title="About SHAASH Beauty Store" align="left" />

        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="font-display text-xl text-charcoal">Our Story</h2>
            <p className="mt-3 leading-relaxed text-charcoal-soft">
              [Brand story placeholder — add the story of how SHAASH Beauty Store came to be, in
              your own words.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal">The Founder</h2>
            <p className="mt-3 leading-relaxed text-charcoal-soft">
              [Founder story placeholder — introduce yourself and what led you to build this
              brand.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal">Our Approach to Hair</h2>
            <p className="mt-3 leading-relaxed text-charcoal-soft">
              [Product philosophy placeholder — describe how you choose textures, colours and
              quality for every extension.]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal">Quality &amp; Care</h2>
            <p className="mt-3 leading-relaxed text-charcoal-soft">
              [Quality info placeholder — describe sourcing, quality checks, and how customers
              should care for their extensions.]
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
