import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  return (
    <section className="bg-charcoal py-16 text-center sm:py-20">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-label text-champagne">
          Ready When You Are
        </p>
        <h2 className="mt-4 font-display text-3xl text-ivory sm:text-4xl">
          Find Your Perfect Hair Extension Today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
          Browse the full collection or let our Hairstyle Finder point you to the right match in
          seconds.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/shop" size="lg" variant="secondary">
            Shop Hair Extensions
          </Button>
          <Button
            href="/hairstyles"
            size="lg"
            variant="outline"
            className="border-ivory/60 text-ivory hover:bg-ivory hover:text-charcoal"
          >
            Find Your Hairstyle
          </Button>
        </div>
      </Container>
    </section>
  );
}
