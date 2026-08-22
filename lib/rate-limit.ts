import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"

const supabaseAdmin = createSupabaseJsClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

  const { count, error: countError } = await supabaseAdmin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart)

  if (countError) {
    console.error("Rate limit check failed:", countError.message)
    return { allowed: true }
  }

  if ((count ?? 0) >= limit) {
    return { allowed: false }
  }

  await supabaseAdmin.from("rate_limit_hits").insert({ key })

  if (Math.random() < 0.01) {
    supabaseAdmin
      .from("rate_limit_hits")
      .delete()
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .then(() => {})
  }

  return { allowed: true }
}