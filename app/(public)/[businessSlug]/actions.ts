"use server"

import { createClient } from "@/lib/supabase/server"
import { generateAvailableSlots } from "@/lib/slots"

export async function getSlotsForDate(serviceId: string, dateString: string) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes, business_id")
    .eq("id", serviceId)
    .single()

  if (!service) throw new Error("Service nahi mila")

  const date = new Date(dateString)
  const dayOfWeek = date.getDay()

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("day_of_week, start_time, end_time")
    .eq("business_id", service.business_id)
    .eq("day_of_week", dayOfWeek)

  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("service_id", serviceId)
    .eq("booking_date", dateString)
    .neq("status", "cancelled")

  return generateAvailableSlots({
    date,
    serviceDurationMinutes: service.duration_minutes,
    rules: rules ?? [],
    existingBookings: existingBookings ?? [],
  })
}