"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function uploadImage(businessId: string, file: File, kind: "logo" | "cover") {
  const supabase = await createClient()

  const ext = file.name.split(".").pop()
  const path = `${businessId}/${kind}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("business-images")
    .upload(path, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from("business-images").getPublicUrl(path)
  return data.publicUrl
}

export async function updateAccountEmail(newEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw new Error(error.message)
}

export async function updateBusinessImages(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const businessId = formData.get("businessId") as string
  const logoFile = formData.get("logo") as File | null
  const coverFile = formData.get("cover") as File | null

  const updates: { logo_url?: string; cover_photo_url?: string } = {}

  if (logoFile && logoFile.size > 0) {
    updates.logo_url = await uploadImage(businessId, logoFile, "logo")
  }

  if (coverFile && coverFile.size > 0) {
    updates.cover_photo_url = await uploadImage(businessId, coverFile, "cover")
  }

  if (Object.keys(updates).length === 0) return

  const { error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", businessId)
    .eq("owner_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
}