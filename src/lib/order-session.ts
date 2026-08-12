"use client";

/**
 * Passes the just-placed order's summary from the checkout form to the
 * confirmation page via sessionStorage, instead of re-fetching the order
 * from the DB by (guessable) order number — there's no auth yet, so a
 * lookup-by-URL would let anyone enumerate other customers' orders.
 */
const STORAGE_KEY = "shaash-last-order";

export interface LastOrderSummary {
  orderNumber: string;
  total: number;
  status: string;
  itemCount: number;
}

export function saveLastOrder(summary: LastOrderSummary) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // Storage unavailable — the confirmation page just falls back to a generic message.
  }
}

export function readLastOrder(orderNumber: string): LastOrderSummary | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrderSummary;
    return parsed.orderNumber === orderNumber ? parsed : null;
  } catch {
    return null;
  }
}
