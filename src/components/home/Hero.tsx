import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface HeroImage {
  src: string;
  alt: string;
}

/** Images are passed in from the page (derived from featured products), not hardcoded here. */
export function Hero({ images = [] }: { images?: HeroImage[] }) {
  const [primary, secondary] = images;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-ivory">
      <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-label text-gold">
            Premium Hair Extensions
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl">
            Effortless Length, Volume &amp; Texture — Made For You
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-charcoal-soft sm:text-lg">
            Premium synthetic hair extensions and accessories, photographed true to colour and
            texture — so you know exactly what&apos;s arriving at your door.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/shop" size="lg">
              Shop Hair Extensions
            </Button>
            <Button href="/hairstyles" size="lg" variant="outline">
              Find Your Hairstyle
            </Button>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          {primary ? (
            <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-3xl bg-beige/40 sm:col-span-1 sm:aspect-[3/4]">
              <Image
                src={primary.src}
                alt={primary.alt}
                fill
                sizes="(min-width: 640px) 40vw, 80vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="col-span-2 aspect-[4/3] rounded-3xl bg-beige/40 sm:col-span-1 sm:aspect-[3/4]" />
          )}
          {secondary && (
            <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-3xl bg-champagne/30 sm:col-span-1 sm:mt-10 sm:aspect-[3/4]">
              <Image
                src={secondary.src}
                alt={secondary.alt}
                fill
                sizes="(min-width: 640px) 40vw, 80vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
