import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const REASONS = [
  {
    icon: "🎨",
    title: "Artist-Curated Selection",
    description:
      "Every extension is personally curated by a beauty artist, considering texture, length, volume, finish and styling versatility — not simply what looks good on a product shelf.",
  },
  {
    icon: "✨",
    title: "Made for Beautiful, Natural Blending",
    description:
      "Our extensions are chosen to blend seamlessly with natural hair, helping you create everything from soft everyday looks to fuller bridal hairstyles.",
  },
  {
    icon: "📏",
    title: "Choose Your Length & Texture",
    description:
      "From straight to wavy to curly, and different lengths and volumes, find an extension that works for your exact styling requirement.",
  },
  {
    icon: "🪡",
    title: "Customisation Is Possible",
    description:
      "Need a different length, texture, volume or finish? Because SHAASH is artist-led, we can help curate or customise your extension based on your hairstyle and requirement.",
  },
  {
    icon: "🤍",
    title: "Professional Bridal Expertise",
    description:
      "Built from real experience in the bridal beauty industry, SHAASH understands what an extension needs to do — hold its shape, blend beautifully, style well and photograph flawlessly.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Why SHAASH" title="Why Choose Us" />
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-champagne/40 text-2xl">
                <span aria-hidden="true">{reason.icon}</span>
              </div>
              <p className="mt-4 font-display text-lg text-charcoal">{reason.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{reason.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
