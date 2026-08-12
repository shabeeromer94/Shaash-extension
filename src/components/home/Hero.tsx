import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface HeroImage {
  src: string;
  alt: string;
}

/** Image is passed in from the page (derived from a featured product), not hardcoded here. */
export function Hero({ image }: { image?: HeroImage }) {
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

        <div className="relative mx-auto w-full max-w-xl">
          {image ? (
            // aspect-[1070/864] matches product 204's img-1 at its own native proportions —
            // object-contain then shows the whole photo at full size, never cropped or letterboxed.
            <div className="relative aspect-[1070/864] overflow-hidden rounded-3xl bg-beige/40">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 50vw, 90vw"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[1070/864] rounded-3xl bg-beige/40" />
          )}
        </div>
      </Container>
    </section>
  );
}
