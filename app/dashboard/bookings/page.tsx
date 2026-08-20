import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BookingsClient from "./BookingsClient"

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("businesses")
    .select("id, accent_color")
    .eq("owner_id", user.id)
    .single()

  if (!business) redirect("/dashboard/onboarding")

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_email,
      booking_date,
      start_time,
      end_time,
      status,
      created_at,
      services!inner (
        id,
        name,
        price,
        business_id
      )
    `)
    .eq("services.business_id", business.id)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true })

  return <BookingsClient initialBookings={bookings ?? []} accentColor={business.accent_color} />
}