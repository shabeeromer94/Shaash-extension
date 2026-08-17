import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

/**
 * Reads credentials straight from env on every call rather than caching them
 * at module load — so switching RAZORPAY_KEY_ID/SECRET from test to live
 * (once the account is verified) just needs a redeploy, no code change.
 */
function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add your Razorpay test keys to .env.local (see SETUP.md)."
    );
  }
  return { keyId, keySecret };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Creates a Razorpay Order via the REST API directly — no razorpay npm
 * package needed for a single authenticated POST. Called server-side only,
 * right before we write the matching order row to the DB.
 */
export async function createRazorpayOrder(params: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getCredentials();

  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/** The key id half of the credential pair — safe to send to the browser to open Checkout. */
export function getRazorpayKeyId(): string {
  return getCredentials().keyId;
}

/** Whether the configured key pair is Razorpay Live Mode rather than Test Mode — live key ids start with "rzp_live_". */
export function isRazorpayLiveMode(): boolean {
  return getCredentials().keyId.startsWith("rzp_live_");
}

/**
 * Verifies the signature Razorpay Checkout hands back on a successful
 * payment: HMAC-SHA256(order_id + "|" + payment_id, key_secret) must match
 * exactly. This — not the client's "success" callback — is what actually
 * proves the payment happened.
 */
export function verifyRazorpaySignature(params: { orderId: string; paymentId: string; signature: string }): boolean {
  const { keySecret } = getCredentials();
  const expected = createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
