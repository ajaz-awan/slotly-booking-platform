import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ServicesClient from "./ServicesClient"

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("businesses")
    .select("id, accent_color")
    .eq("owner_id", user.id)
    .single()

  if (!business) redirect("/dashboard/onboarding")

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })

  return (
    <ServicesClient
      initialServices={services ?? []}
      accentColor={business.accent_color}
    />
  )
}