import { getServerClient } from "@/lib/supabase/server";
import type { InspirationItem } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRow = any;

const INSPIRATION_SELECT = `
  *,
  product_links:hairstyle_inspiration_products(
    sort_order,
    product:products(*, images:product_images(*))
  )
`;

function logQueryError(label: string, error: unknown) {
  console.error(`[queries/inspiration] ${label} failed — is Supabase set up? (see SETUP.md)`, error);
}

function mapInspiration(row: RawRow): InspirationItem {
  const links = (row.product_links ?? [])
    .slice()
    .sort((a: RawRow, b: RawRow) => a.sort_order - b.sort_order);
  const products = links
    .map((link: RawRow) => link.product)
    .filter(Boolean)
    .map((p: RawRow) => ({
      ...p,
      images: (p.images ?? []).slice().sort((a: RawRow, b: RawRow) => a.sort_order - b.sort_order),
    }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit it from `rest`
  const { product_links, ...rest } = row;
  return { ...rest, products } as InspirationItem;
}

/** Published inspiration entries, in curated order — powers /inspiration. */
export async function getAllInspiration(): Promise<InspirationItem[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("hairstyle_inspiration")
      .select(INSPIRATION_SELECT)
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapInspiration);
  } catch (error) {
    logQueryError("getAllInspiration", error);
    return [];
  }
}

export async function getInspirationBySlug(slug: string): Promise<InspirationItem | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("hairstyle_inspiration")
      .select(INSPIRATION_SELECT)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapInspiration(data) : null;
  } catch (error) {
    logQueryError(`getInspirationBySlug(${slug})`, error);
    return null;
  }
}
