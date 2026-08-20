import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, accent_color, logo_url, cover_photo_url")
    .eq("owner_id", user.id)
    .single()

  if (!business) redirect("/dashboard/onboarding")

  return <SettingsClient business={business} />
}
