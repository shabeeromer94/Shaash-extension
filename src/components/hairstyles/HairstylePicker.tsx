import Image from "next/image";
import Link from "next/link";
import type { Hairstyle } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * Plain links that set ?style=<slug> — the Finder needs no client JS at all;
 * picking a style is just a navigation that re-renders the results server-side.
 */
export function HairstylePicker({
  hairstyles,
  activeSlug,
}: {
  hairstyles: Hairstyle[];
  activeSlug?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {hairstyles.map((style) => {
        const active = style.slug === activeSlug;
        return (
          <Link
            key={style.id}
            href={`/hairstyles?style=${style.slug}#results`}
            className={cn(
              "group flex flex-col overflow-hidden rounded-2xl border-2 bg-beige/40 transition-colors",
              active ? "border-charcoal" : "border-transparent hover:border-taupe/60"
            )}
          >
            {/* aspect-[3/5] is close to these reference photos' own portrait proportions —
                object-contain shows the whole photo uncropped instead of cutting off hair/jewellery detail. */}
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
            <p
              className={cn(
                "px-3 py-2 text-center font-display text-sm sm:text-base",
                active ? "bg-champagne/30 text-charcoal" : "bg-ivory/85 text-charcoal"
              )}
            >
              {style.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
