"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { bookingStatusSchema } from "@/lib/validations"

export async function updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled" | "completed") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const id = z.string().uuid("Booking ID sahi nahi hai").parse(bookingId)
  const parsedStatus = bookingStatusSchema.parse(status)

  const { error } = await supabase
    .from("bookings")
    .update({ status: parsedStatus })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/bookings")
}