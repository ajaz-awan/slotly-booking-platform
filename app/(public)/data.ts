import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
import { unstable_cache } from "next/cache"

export const getCachedBusinesses = unstable_cache(
  async () => {
    const supabase = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("businesses")
      .select("id, name, slug, category, cover_photo_url, accent_color, services(price)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(24)
    return data ?? []
  },
  ["landing-businesses"],
  { revalidate: 60 }
)