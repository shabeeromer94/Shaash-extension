import { getServerClient } from "@/lib/supabase/server";
import type { FilterOptions, Product, ProductFilters } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRow = any;

const PRODUCT_SELECT = `
  *,
  images:product_images(*),
  category:categories(*),
  hairstyle_links:product_hairstyles(hairstyle:hairstyles(*))
`;

const EMPTY_FILTER_OPTIONS: FilterOptions = {
  textures: [],
  colours: [],
  lengths: [],
  minPrice: 0,
  maxPrice: 0,
};

function mapProduct(row: RawRow): Product {
  const images = (row.images ?? [])
    .slice()
    .sort((a: RawRow, b: RawRow) => a.sort_order - b.sort_order);
  const hairstyles = (row.hairstyle_links ?? [])
    .map((link: RawRow) => link.hairstyle)
    .filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit it from `rest`
  const { hairstyle_links, ...rest } = row;
  return { ...rest, images, hairstyles } as Product;
}

/**
 * Every function below fails soft: if Supabase isn't reachable yet (no
 * project created, env vars not set, schema not run), it logs and returns
 * an empty result instead of throwing — so `next build` and page renders
 * still succeed before the database exists, and self-heal once it does.
 */
function logQueryError(label: string, error: unknown) {
  console.error(`[queries/products] ${label} failed — is Supabase set up? (see SETUP.md)`, error);
}

/** All visible products, optionally filtered/sorted. Powers /shop and the homepage sections. */
export async function getAllProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const supabase = getServerClient();
    let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_hidden", false);

    if (filters.texture) query = query.eq("texture", filters.texture);
    if (filters.colour) query = query.eq("colour", filters.colour);
    if (filters.minPrice != null) query = query.gte("price_inr", filters.minPrice);
    if (filters.maxPrice != null) query = query.lte("price_inr", filters.maxPrice);
    if (filters.availableOnly) query = query.gt("stock_quantity", 0);

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price_inr", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price_inr", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    let products = (data ?? []).map(mapProduct);

    // Hairstyle tag-matching happens client-side after the fetch — the catalog is
    // small enough that this stays simple and correct without a fragile nested-join filter.
    if (filters.hairstyle) {
      products = products.filter((p) => p.hairstyles?.some((h) => h.slug === filters.hairstyle));
    }

    return products;
  } catch (error) {
    logQueryError("getAllProducts", error);
    return [];
  }
}

export async function getProductByCode(code: string): Promise<Product | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("code", code)
      .eq("is_hidden", false)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : null;
  } catch (error) {
    logQueryError(`getProductByCode(${code})`, error);
    return null;
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_hidden", false)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (error) {
    logQueryError("getFeaturedProducts", error);
    return [];
  }
}

/** Same category, falling back to same texture, excluding the product itself. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  try {
    const supabase = getServerClient();
    const related: Product[] = [];
    const seen = new Set<string>([product.id]);

    if (product.category_id) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_hidden", false)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(limit);
      if (error) throw error;
      for (const row of (data ?? []).map(mapProduct)) {
        if (!seen.has(row.id)) {
          related.push(row);
          seen.add(row.id);
        }
      }
    }

    if (related.length < limit && product.texture) {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_hidden", false)
        .eq("texture", product.texture)
        .neq("id", product.id)
        .limit(limit);
      if (error) throw error;
      for (const row of (data ?? []).map(mapProduct)) {
        if (!seen.has(row.id) && related.length < limit) {
          related.push(row);
          seen.add(row.id);
        }
      }
    }

    return related.slice(0, limit);
  } catch (error) {
    logQueryError(`getRelatedProducts(${product.code})`, error);
    return [];
  }
}

/** Products tagged with a given hairstyle slug — powers the Extension Finder results. */
export async function getProductsByHairstyleSlug(slug: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.hairstyles?.some((h) => h.slug === slug));
}

/** Distinct filter values + price range, computed from live data (never hardcoded). */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("texture, colour, length_label, price_inr")
      .eq("is_hidden", false);
    if (error) throw error;
    const rows = data ?? [];

    const textures = Array.from(new Set(rows.map((r) => r.texture).filter(Boolean))) as string[];
    const colours = Array.from(new Set(rows.map((r) => r.colour).filter(Boolean))) as string[];
    const lengths = Array.from(new Set(rows.map((r) => r.length_label).filter(Boolean))) as string[];
    const prices = rows.map((r) => r.price_inr as number);

    return {
      textures: textures.sort(),
      colours: colours.sort(),
      lengths: lengths.sort(),
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
    };
  } catch (error) {
    logQueryError("getFilterOptions", error);
    return EMPTY_FILTER_OPTIONS;
  }
}
