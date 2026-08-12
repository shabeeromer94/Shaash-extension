import { getServerClient } from "@/lib/supabase/server";
import type { Hairstyle } from "@/lib/types";

function logQueryError(label: string, error: unknown) {
  console.error(`[queries/hairstyles] ${label} failed — is Supabase set up? (see SETUP.md)`, error);
}

/** Full hairstyle taxonomy, in display order — powers the Finder's picker grid. */
export async function getAllHairstyles(): Promise<Hairstyle[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("hairstyles")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logQueryError("getAllHairstyles", error);
    return [];
  }
}

export async function getHairstyleBySlug(slug: string): Promise<Hairstyle | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("hairstyles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  } catch (error) {
    logQueryError(`getHairstyleBySlug(${slug})`, error);
    return null;
  }
}
