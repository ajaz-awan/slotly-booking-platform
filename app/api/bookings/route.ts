import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Login zaroori hai booking ke liye" }, { status: 401 })
  }

  const { allowed } = await checkRateLimit(`booking:${user.id}`, 5, 5 * 60)
  if (!allowed) {
    return NextResponse.json({ error: "Bohat zyada bookings ho gayi hain, thodi der baad try karo" }, { status: 429 })
  }

  const body = await request.json()
  const { serviceId, bookingDate, startTime } = body

  if (!serviceId || !bookingDate || !startTime) {
    return NextResponse.json({ error: "Zaroori fields missing hain" }, { status: 400 })
  }

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single()

  if (!service) {
    return NextResponse.json({ error: "Service nahi mili" }, { status: 404 })
  }

  const [h, m] = startTime.split(":").map(Number)
  const endMinutes = h * 60 + m + service.duration_minutes
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`

  const customerName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Guest"

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      service_id: serviceId,
      customer_id: user.id,
      customer_name: customerName,
      customer_email: user.email,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ye slot abhi kisi aur ne book kar liya, dusra select karo" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking })
}