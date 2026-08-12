import Image from "next/image";
import Link from "next/link";
import type { Hairstyle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils/cn";

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
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {hairstyles.map((style) => (
            <Link
              key={style.id}
              href={`/hairstyles?style=${style.slug}`}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-beige/50 p-4 text-center"
            >
              {style.image_url && (
                <Image
                  src={style.image_url}
                  alt={style.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span
                className={cn(
                  "relative z-10 font-display text-base text-charcoal",
                  style.image_url && "rounded-full bg-ivory/85 px-3 py-1"
                )}
              >
                {style.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
