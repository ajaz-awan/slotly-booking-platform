import Navbar from "@/components/ui/Navbar"
import { createClient } from "@/lib/supabase/server"
import BusinessDiscovery from "./BusinessDiscovery"

export default async function LandingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, slug, category, cover_photo_url, accent_color, services(price)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen bg-surface-black">
      <Navbar showSearch={false} isSignedIn={!!user} />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-0 sm:pt-24">
        <h1 className="font-display leading-[1.05]">
          <span className="block text-4xl font-medium text-text-primary sm:text-6xl">
            Book your
          </span>
          <span className="block text-4xl font-medium text-text-primary sm:text-6xl">
            next appointment
          </span>
          <span className="block text-4xl font-bold text-accent sm:text-6xl">
            in seconds.
          </span>
        </h1>
        <p className="mt-6 max-w-md text-base text-text-muted sm:text-lg">
          Find trusted salons, clinics, and tutors near you — see live
          availability and reserve instantly.
        </p>

        <BusinessDiscovery businesses={businesses ?? []} />
      </section>
    </div>
  )
}
