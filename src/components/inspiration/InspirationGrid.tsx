import type { InspirationItem } from "@/lib/types";
import { InspirationCard } from "@/components/inspiration/InspirationCard";

export function InspirationGrid({ items }: { items: InspirationItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-charcoal-soft">
        More hairstyle inspiration is on its way.
      </p>
    );
  }

  return (
    // Instagram's embed widget won't shrink below ~326px, so this caps at 2
    // columns (a 3-up grid would squeeze each embed too tight) and waits
    // for the md breakpoint to go 2-up — at sm (640px) two columns would
    // still be narrower than the embed's own minimum.
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {items.map((item) => (
        <InspirationCard key={item.id} item={item} />
      ))}
    </div>
  );
}
