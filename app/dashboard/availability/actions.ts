"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { availabilitySchema } from "@/lib/validations"

async function getOwnerBusinessId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!business) throw new Error("No business found")
  return business.id
}

export async function saveAvailability(rules: unknown) {
  const supabase = await createClient()
  const businessId = await getOwnerBusinessId()
  const parsedRules = availabilitySchema.parse(rules)

  const { error: deleteError } = await supabase
    .from("availability_rules")
    .delete()
    .eq("business_id", businessId)

  if (deleteError) throw new Error(deleteError.message)

  const rowsToInsert = parsedRules
    .filter((r) => r.enabled)
    .map((r) => ({
      business_id: businessId,
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
    }))

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("availability_rules")
      .insert(rowsToInsert)

    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath("/dashboard/availability")
}