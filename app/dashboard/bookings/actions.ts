"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { bookingStatusSchema } from "@/lib/validations"

export async function updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const parsed = bookingStatusSchema.parse({ bookingId, status })

  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.status })
    .eq("id", parsed.bookingId)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/bookings")
}