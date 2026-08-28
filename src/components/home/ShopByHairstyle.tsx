"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Hairstyle } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * A compact horizontal shelf, not a big grid section — always a scroll row
 * (even on desktop) with arrow buttons to page through it, so this stays a
 * quick jumping-off point rather than a tall block of the homepage.
 */
export function ShopByHairstyle({ hairstyles }: { hairstyles: Hairstyle[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  if (hairstyles.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section className="bg-cream py-10 sm:py-12">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="Find Your Look"
            title="Shop by Hairstyle"
            className="mb-0"
          />
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-charcoal transition-colors hover:border-charcoal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-charcoal transition-colors hover:border-charcoal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide pb-2"
        >
          {hairstyles.map((style) => (
            <Link
              key={style.id}
              href={`/hairstyles?style=${style.slug}#results`}
              className="group flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-xl border-2 border-transparent bg-beige/50 transition-colors hover:border-taupe/60 sm:w-44"
            >
              {/* aspect-[3/5] is close to these reference photos' own portrait proportions —
                  object-contain shows the whole photo uncropped instead of cutting off detail. */}
              <div className="relative aspect-[3/5] w-full">
                {style.image_url && (
                  <Image
                    src={style.image_url}
                    alt={style.name}
                    fill
                    sizes="180px"
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
