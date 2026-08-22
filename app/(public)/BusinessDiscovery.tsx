"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Flower2,
  GraduationCap,
  Scissors,
  Sparkles,
  Stethoscope,
} from "lucide-react"

const CATEGORIES = [
  { label: "Salon", icon: Sparkles },
  { label: "Barbershop", icon: Scissors },
  { label: "Clinic", icon: Stethoscope },
  { label: "Tutor", icon: GraduationCap },
  { label: "Spa", icon: Flower2 },
]

type Business = {
  id: string
  name: string
  slug: string
  category: string
  cover_photo_url: string | null
  accent_color: string
  services: { price: number }[]
}

export default function BusinessDiscovery({ businesses }: { businesses: Business[] }) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return businesses.filter((biz) => {
      const matchesQuery =
        q.length === 0 ||
        biz.name.toLowerCase().includes(q) ||
        biz.category.toLowerCase().includes(q)

      const matchesCategory =
        !activeCategory || biz.category.toLowerCase() === activeCategory.toLowerCase()

      return matchesQuery && matchesCategory
    })
  }, [businesses, query, activeCategory])

  return (
    <>
      <div className="mt-10 max-w-xl">
        <div className="flex items-center gap-2 rounded-pill bg-surface-card px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services or businesses..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
        {CATEGORIES.map(({ label, icon: Icon }) => {
          const isActive = activeCategory?.toLowerCase() === label.toLowerCase()

          return (
            <button
              key={label}
              onClick={() => setActiveCategory(isActive ? null : label)}
              className="flex shrink-0 flex-col items-center gap-2"
              suppressHydrationWarning
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full border transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-surface-black"
                    : "border-surface-border bg-surface-card text-text-primary"
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span
                className={`text-xs ${isActive ? "text-accent" : "text-text-muted"}`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      <section className="pb-24 pt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Businesses on Slotly
          </h2>
        </div>

        {filtered.length === 0 && (
          <p className="text-text-muted text-sm">
            {businesses.length === 0
              ? "Abhi tak koi business list nahi hai. Sabse pehle business bano!"
              : "Is search se koi business nahi mila. Kuch aur try karo."}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((biz) => {
            const prices = (biz.services ?? []).map((s) => s.price)
            const startingPrice = prices.length > 0 ? Math.min(...prices) : null

            return (
              <Link
                key={biz.id}
                href={`/${biz.slug}`}
                className="group relative block h-72 overflow-hidden rounded-card bg-surface-card"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={biz.cover_photo_url ? { backgroundImage: `url('${biz.cover_photo_url}')` } : {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <span
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-surface-black"
                  style={{ backgroundColor: biz.accent_color }}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs uppercase tracking-wide text-white/70">{biz.category}</p>
                  <p className="mt-1 font-display text-lg font-medium text-white">{biz.name}</p>
                  <p className="mt-1 text-sm text-white/80">
                    {startingPrice !== null ? `Starting at Rs. ${startingPrice}` : "View services"}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
