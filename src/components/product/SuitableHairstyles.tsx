import Link from "next/link";
import type { Hairstyle } from "@/lib/types";

/** Pulls straight from the product's hairstyle tags — never hardcoded per product. */
export function SuitableHairstyles({ hairstyles }: { hairstyles: Hairstyle[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-charcoal">Perfect For These Hairstyles</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {hairstyles.map((h) => (
          <Link
            key={h.id}
            href={`/hairstyles?style=${h.slug}`}
            className="rounded-full border border-line px-4 py-2 text-sm text-charcoal-soft transition-colors hover:border-charcoal hover:text-charcoal"
          >
            {h.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
