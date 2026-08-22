"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { serviceSchema } from "@/lib/validations"

type ServiceInput = {
  name: string
  description: string
  duration_minutes: number
  price: number
}

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

export async function createService(input: ServiceInput) {
  const supabase = await createClient()
  const businessId = await getOwnerBusinessId()
  const data = serviceSchema.parse(input)

  const { error } = await supabase.from("services").insert({
    business_id: businessId,
    name: data.name,
    description: data.description,
    duration_minutes: data.duration_minutes,
    price: data.price,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/services")
}

export async function updateService(serviceId: string, input: ServiceInput) {
  const supabase = await createClient()
  const businessId = await getOwnerBusinessId()
  const data = serviceSchema.parse(input)

  const { error } = await supabase
    .from("services")
    .update({
      name: data.name,
      description: data.description,
      duration_minutes: data.duration_minutes,
      price: data.price,
    })
    .eq("id", serviceId)
    .eq("business_id", businessId)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/services")
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  const supabase = await createClient()
  const businessId = await getOwnerBusinessId()

  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)
    .eq("business_id", businessId)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/services")
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  const businessId = await getOwnerBusinessId()

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("business_id", businessId)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/services")
}