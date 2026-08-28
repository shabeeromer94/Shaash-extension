/** Lowercase, hyphenated, URL-safe version of a label — e.g. "Hair Donuts" -> "hair-donuts". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
