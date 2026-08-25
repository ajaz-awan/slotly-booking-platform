import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/ui/Navbar"
import { Scissors, Calendar, ClipboardList, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect("/login")

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, accent_color")
    .eq("owner_id", user.id)
    .single()

   if (!business) {
    return (
      <div className="min-h-screen bg-surface-black">
        <Navbar showSearch={false} isSignedIn={true} />
        <div className="px-6 py-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display italic text-2xl font-medium text-text-primary mb-1">
              Welcome
            </h1>
            <p className="text-text-muted text-sm mb-8">
              Book appointments with your favourite businesses, or set up your own.
            </p>

            <Link
              href="/dashboard/onboarding"
              className="block rounded-card bg-surface-card p-6 hover:bg-surface-card-hover transition-colors border border-surface-border"
            >
              <h3 className="text-text-primary font-medium">Open Your Business</h3>
              <p className="text-text-muted text-sm mt-1">
                List your services and start taking bookings — verified in a couple of minutes.
              </p>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const [{ count: servicesCount }, { count: bookingsCount }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id),
    supabase
      .from("bookings")
      .select("*, services!inner(business_id)", { count: "exact", head: true })
      .eq("services.business_id", business.id),
    supabase
      .from("bookings")
      .select("*, services!inner(business_id)", { count: "exact", head: true })
      .eq("services.business_id", business.id)
      .eq("status", "pending"),
  ])

  const accentColor = business.accent_color

  return (
    <div className="min-h-screen bg-surface-black">
      <Navbar showSearch={false} isSignedIn={true} businessName={business.name} hasBusiness={true} />
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-display italic text-2xl font-medium text-text-primary">{business.name}</h1>
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
              className="rounded-card bg-surface-card p-5 hover:bg-surface-card-hover transition-colors"
            >
              <div
                style={{ backgroundColor: `${accentColor}1A` }}
                className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
              >
                <Scissors size={18} style={{ color: accentColor }} />
              </div>
              <h3 className="text-text-primary font-medium text-sm">Services</h3>
              <p className="text-text-muted text-xs mt-1">{servicesCount ?? 0} services</p>
            </Link>

            <Link
              href="/dashboard/availability"
              className="rounded-card bg-surface-card p-5 hover:bg-surface-card-hover transition-colors"
            >
              <div
                style={{ backgroundColor: `${accentColor}1A` }}
                className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
              >
                <Calendar size={18} style={{ color: accentColor }} />
              </div>
              <h3 className="text-text-primary font-medium text-sm">Availability</h3>
              <p className="text-text-muted text-xs mt-1">Working hours set karo</p>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="relative rounded-card bg-surface-card p-5 hover:bg-surface-card-hover transition-colors"
            >
              {(pendingCount ?? 0) > 0 && (
                <span className="absolute right-4 top-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-medium text-surface-black">
                  {pendingCount ?? 0}
                </span>
              )}
              <div
                style={{ backgroundColor: `${accentColor}1A` }}
                className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
              >
                <ClipboardList size={18} style={{ color: accentColor }} />
              </div>
              <h3 className="text-text-primary font-medium text-sm">Bookings</h3>
              <p className="text-text-muted text-xs mt-1">
                {(pendingCount ?? 0) > 0 ? `${pendingCount} pending approval` : `${bookingsCount ?? 0} total bookings`}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}