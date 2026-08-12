import Image from "next/image";
import Link from "next/link";
import type { InspirationItem } from "@/lib/types";

export function InspirationCard({ item }: { item: InspirationItem }) {
  return (
    <Link href={`/inspiration/${item.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige/40">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-taupe">Image coming soon</div>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg text-charcoal">{item.title}</h3>
      {item.short_description && (
        <p className="mt-1 text-sm leading-relaxed text-charcoal-soft">{item.short_description}</p>
      )}
    </Link>
  );
}
