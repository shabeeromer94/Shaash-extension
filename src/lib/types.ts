/**
 * TypeScript types mirroring the Supabase schema (see /supabase/schema.sql).
 * Keep this in sync with the SQL whenever a column is added/renamed.
 */

export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock" | "hidden";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Hairstyle {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

/** A size/price option on a product — e.g. Small/Medium/Big. See supabase/schema.sql. */
export interface ProductVariant {
  id: string;
  product_id: string;
  label: string;
  price_inr: number;
  stock_quantity: number;
  sort_order: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_inr: number;
  length_label: string | null;
  length_inches: number | null;
  texture: string | null;
  colour: string | null;
  category_id: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_hidden: boolean;
  featured: boolean;
  /** Non-null when this listing shares physical inventory with another product code (see supabase/schema.sql). */
  stock_group: string | null;
  /** Non-null when this listing is one of several designs/variants grouped under one family tile on /shop (see supabase/schema.sql). */
  accessory_group: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  // Populated by joined queries — not always present.
  images?: ProductImage[];
  hairstyles?: Hairstyle[];
  category?: Category | null;
  /** Size/price options, sorted by sort_order — absent/empty means this product is sold at its own price_inr as-is. */
  variants?: ProductVariant[];
}

export interface InspirationItem {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  body: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  products?: Product[];
}

export interface ProductFilters {
  category?: string;
  texture?: string;
  colour?: string;
  hairstyle?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
}

export interface FilterOptions {
  textures: string[];
  colours: string[];
  lengths: string[];
  minPrice: number;
  maxPrice: number;
}

// --- Checkout / order-related types (client payload for /api/checkout) ---

export interface CheckoutCartItem {
  productCode: string;
  quantity: number;
}

export interface CheckoutPayload {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  items: CheckoutCartItem[];
}

export interface OrderSummary {
  orderNumber: string;
  total: number;
  status: string;
}
