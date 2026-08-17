import { Badge } from "@/components/ui/Badge";
import type { AvailabilityStatus } from "@/lib/types";
import { AVAILABILITY_LABEL } from "@/lib/utils/stock";

const TONE: Record<AvailabilityStatus, "success" | "warning" | "danger" | "neutral"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
  hidden: "neutral",
};

export function StockBadge({ status, size = "md" }: { status: AvailabilityStatus; size?: "sm" | "md" }) {
  return (
    <Badge tone={TONE[status]} size={size}>
      {AVAILABILITY_LABEL[status]}
    </Badge>
  );
}
