import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AvailabilityClient from "./AvailabilityClient"

export default async function AvailabilityPage() {
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

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("day_of_week, start_time, end_time")
    .eq("business_id", business.id)

  return <AvailabilityClient initialRules={rules ?? []} accentColor={business.accent_color} />
}