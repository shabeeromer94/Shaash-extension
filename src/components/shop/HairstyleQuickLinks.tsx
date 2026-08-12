import Image from "next/image";
import Link from "next/link";
import type { Hairstyle } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * A horizontal shelf of hairstyle shortcuts at the top of /shop — tap one and
 * land straight on the filtered results (`/shop?hairstyle=slug`), instead of
 * routing through the Extension Finder page first.
 */
export function HairstyleQuickLinks({
  hairstyles,
  activeSlug,
}: {
  hairstyles: Hairstyle[];
  activeSlug?: string;
}) {
  if (hairstyles.length === 0) return null;

  return (
    <div className="mb-10">
      <p className="text-xs font-semibold uppercase tracking-label text-gold">Shop by Hairstyle</p>
      <div className="scrollbar-hide mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {hairstyles.map((style) => {
          const active = style.slug === activeSlug;
          return (
            <Link
              key={style.id}
              href={`/shop?hairstyle=${style.slug}`}
              className={cn(
                "group flex w-28 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border-2 bg-beige/50 sm:w-32",
                active ? "border-charcoal" : "border-transparent"
              )}
            >
              {/* aspect-[3/5] is close to these reference photos' own portrait proportions —
                  object-contain shows the whole photo uncropped instead of cutting off detail. */}
              <div className="relative aspect-[3/5] w-full">
                {style.image_url && (
                  <Image
                    src={style.image_url}
                    alt={style.name}
                    fill
                    sizes="140px"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <span className="bg-ivory/85 px-2 py-1.5 text-center text-xs font-semibold uppercase leading-tight tracking-label text-charcoal">
                {style.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
