import { Badge } from "@/components/ui/Badge";
import type { AvailabilityStatus } from "@/lib/types";
import { AVAILABILITY_LABEL } from "@/lib/utils/stock";

const TONE: Record<AvailabilityStatus, "success" | "warning" | "danger" | "neutral"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
  hidden: "neutral",
};

export function StockBadge({ status }: { status: AvailabilityStatus }) {
  return <Badge tone={TONE[status]}>{AVAILABILITY_LABEL[status]}</Badge>;
}
