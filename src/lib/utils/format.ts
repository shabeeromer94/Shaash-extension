/** Formats a numeric rupee amount as an Indian-locale currency string, e.g. 600 -> "₹600". */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Turns "201 Natural Wavy Highlights Hair Extension" + code into a display-friendly title. */
export function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
