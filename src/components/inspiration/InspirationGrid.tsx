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
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <InspirationCard key={item.id} item={item} />
      ))}
    </div>
  );
}
