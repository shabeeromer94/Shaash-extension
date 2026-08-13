import Image from "next/image";
import Link from "next/link";
import type { Hairstyle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Pulls hairstyles straight from the DB — add/edit rows there, nothing to change here. */
export function ShopByHairstyle({ hairstyles }: { hairstyles: Hairstyle[] }) {
  if (hairstyles.length === 0) return null;

  return (
    <section className="bg-cream py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Find Your Look"
          title="Shop by Hairstyle"
          description="Not sure what to pick? Start from the hairstyle you're going for."
        />
        {/* Mobile: a horizontal scroll shelf (same interaction as the hairstyle
            quick-links on /shop) — fixed-width snap-aligned cards. From sm up,
            it switches to a regular grid with cards filling their own cell. */}
        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {hairstyles.map((style) => (
            <Link
              key={style.id}
              href={`/hairstyles?style=${style.slug}`}
              className="group flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-beige/50 transition-colors hover:border-taupe/60 sm:w-auto sm:shrink"
            >
              {/* aspect-[3/5] is close to these reference photos' own portrait proportions —
                  object-contain shows the whole photo uncropped instead of cutting off detail. */}
              <div className="relative aspect-[3/5] w-full">
                {style.image_url && (
                  <Image
                    src={style.image_url}
                    alt={style.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, 40vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="bg-ivory/85 px-3 py-2 text-center font-display text-sm text-charcoal sm:text-base">
                {style.name}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
