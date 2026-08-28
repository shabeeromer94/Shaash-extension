import Image from "next/image";
import Link from "next/link";
import type { InspirationItem } from "@/lib/types";
import { InstagramEmbed } from "@/components/inspiration/InstagramEmbed";

export function InspirationCard({ item }: { item: InspirationItem }) {
  return (
    <div className="flex flex-col">
      {item.instagram_reel_url ? (
        // The Reel is its own interactive embed (Instagram's iframe) — it
        // can't sit inside the title's <Link> below (nested interactive
        // content), so it renders standalone here.
        <InstagramEmbed url={item.instagram_reel_url} />
      ) : (
        <Link href={`/inspiration/${item.slug}`} className="group block">
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
        </Link>
      )}
      <Link href={`/inspiration/${item.slug}`} className="group mt-4">
        <h3 className="font-display text-lg text-charcoal group-hover:underline">{item.title}</h3>
      </Link>
      {item.short_description && (
        <p className="mt-1 text-sm leading-relaxed text-charcoal-soft">{item.short_description}</p>
      )}
    </div>
  );
}
