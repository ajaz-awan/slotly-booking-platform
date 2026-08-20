import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Scissors, Calendar, ClipboardList, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, accent_color")
    .eq("owner_id", user.id)
    .single()

  if (!business) redirect("/dashboard/onboarding")

  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*, services!inner(business_id)", { count: "exact", head: true })
    .eq("services.business_id", business.id)

  const accentColor = business.accent_color

  return (
    <div className="min-h-screen bg-surface-black px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl font-semibold text-text-primary">{business.name}</h1>
          <Link
            href={`/${business.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
          >
            View public page
            <ExternalLink size={12} />
          </Link>
        </div>
        <p className="text-text-muted text-sm mb-8">Apna business yahan se manage karo</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/services"
            className="rounded-2xl bg-surface-card p-5 hover:bg-surface-card/70 transition-colors"
          >
            <div
              style={{ backgroundColor: `${accentColor}1A` }}
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
            >
              <Scissors size={18} style={{ color: accentColor }} />
            </div>
            <h3 className="text-text-primary font-medium text-sm">Services</h3>
            <p className="text-text-muted text-xs mt-1">{servicesCount ?? 0} services</p>
          </Link>

          <Link
            href="/dashboard/availability"
            className="rounded-2xl bg-surface-card p-5 hover:bg-surface-card/70 transition-colors"
          >
            <div
              style={{ backgroundColor: `${accentColor}1A` }}
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
            >
              <Calendar size={18} style={{ color: accentColor }} />
            </div>
            <h3 className="text-text-primary font-medium text-sm">Availability</h3>
            <p className="text-text-muted text-xs mt-1">Working hours set karo</p>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="rounded-2xl bg-surface-card p-5 hover:bg-surface-card/70 transition-colors"
          >
            <div
              style={{ backgroundColor: `${accentColor}1A` }}
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
            >
              <ClipboardList size={18} style={{ color: accentColor }} />
            </div>
            <h3 className="text-text-primary font-medium text-sm">Bookings</h3>
            <p className="text-text-muted text-xs mt-1">{bookingsCount ?? 0} total bookings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}