import { getServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("[queries/categories] getAllCategories failed — is Supabase set up? (see SETUP.md)", error);
    return [];
  }
}
