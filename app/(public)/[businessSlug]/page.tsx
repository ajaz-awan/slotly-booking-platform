import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BusinessPageClient from "./BusinessPageClient"

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>
}) {
  const { businessSlug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, category, accent_color, logo_url, cover_photo_url")
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .single()

  if (!business) notFound()

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  return <BusinessPageClient business={business} services={services ?? []} />
}