import { Camera, HeartHandshake, Ruler, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// PLACEHOLDER copy — review against real brand/operational claims before launch.
const REASONS = [
  {
    icon: Camera,
    title: "True-to-Life Photography",
    description: "Every product photo is shown unedited, so colour and texture match what arrives.",
  },
  {
    icon: Ruler,
    title: "Length & Texture for Every Look",
    description: "From soft waves to voluminous curls, browse by the exact length and texture you need.",
  },
  {
    icon: Sparkles,
    title: "Premium Synthetic Quality",
    description: "Selected for a natural look and feel that holds up to everyday styling.",
  },
  {
    icon: HeartHandshake,
    title: "Here to Help You Choose",
    description: "Not sure what suits you? Our Hairstyle Finder points you to the right match.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Why SHAASH" title="Why Choose Us" />
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-champagne/40 text-charcoal">
                <reason.icon className="h-5 w-5" />
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
