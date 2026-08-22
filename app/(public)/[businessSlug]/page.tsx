import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BusinessPageClient from "./BusinessPageClient"

export const revalidate = 60

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>
}) {
  const { businessSlug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, category, accent_color, logo_url, cover_photo_url, services(id, name, description, duration_minutes, price, is_active, created_at)"
    )
    .eq("slug", businessSlug)
    .eq("is_active", true)
    .single()

  if (!business) notFound()

  const services = (business.services ?? [])
    .filter((s) => s.is_active)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  return <BusinessPageClient business={business} services={services} />
}