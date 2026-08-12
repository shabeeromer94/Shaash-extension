export type DeliveryMethod = "local" | "courier";

/**
 * Local (within Chennai) orders are self-pickup from here — shown to the
 * customer when they choose that option so they can arrange their own
 * Rapido/Porter rider (or collect in person). No customer address is
 * collected for these orders.
 */
export const PICKUP_ADDRESS = {
  line1: "Metrozone D Tower, D-1004, 10th Floor",
  line2: "Anna Nagar West",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600040",
} as const;

const TAMIL_NADU_BASE_FARE = 120;
const OUTSIDE_TAMIL_NADU_BASE_FARE = 140;
const ADDITIONAL_ITEM_FARE = 10;

function isTamilNadu(state: string): boolean {
  return state.trim().toLowerCase().replace(/\s+/g, "") === "tamilnadu";
}

/**
 * Local delivery is free self-pickup. Courier is a base fare covering the
 * first item, plus a flat per-additional-item fee — the base fare depends on
 * whether the delivery state is Tamil Nadu. This is the single source of
 * truth for the fee: used both for the live estimate shown at checkout and
 * for the authoritative charge computed server-side in /api/checkout.
 */
export function calculateShippingFee(params: {
  deliveryMethod: DeliveryMethod;
  state: string;
  totalQuantity: number;
}): number {
  if (params.deliveryMethod === "local" || params.totalQuantity <= 0) return 0;
  const baseFare = isTamilNadu(params.state) ? TAMIL_NADU_BASE_FARE : OUTSIDE_TAMIL_NADU_BASE_FARE;
  return baseFare + ADDITIONAL_ITEM_FARE * (params.totalQuantity - 1);
}
