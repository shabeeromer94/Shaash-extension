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
              "group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-4 text-center transition-colors",
              active ? "border-charcoal bg-champagne/30" : "border-transparent bg-beige/40 hover:border-taupe/60"
            )}
          >
            {style.image_url && (
              <Image
                src={style.image_url}
                alt={style.name}
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-cover opacity-90"
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
        );
      })}
    </div>
  );
}
