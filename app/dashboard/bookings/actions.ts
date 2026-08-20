"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/bookings")
}