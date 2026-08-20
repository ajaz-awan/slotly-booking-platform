"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

const CATEGORIES = ["Salon", "Barbershop", "Clinic", "Tutor", "Spa"]

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
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory?.toLowerCase() === cat.toLowerCase()

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`rounded-pill border px-4 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-accent bg-accent text-surface-black"
                    : "border-surface-border bg-surface-card text-text-primary hover:border-accent hover:text-accent"
                }`}
                suppressHydrationWarning
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-0 pb-24 pt-12">
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

        <div className="flex gap-4 overflow-x-auto pb-2">
          {filtered.map((biz) => {
            const prices = (biz.services ?? []).map((s) => s.price)
            const startingPrice = prices.length > 0 ? Math.min(...prices) : null

            return (
              <Link
                key={biz.id}
                href={`/${biz.slug}`}
                className="w-64 shrink-0 rounded-card border border-surface-border bg-surface-card overflow-hidden"
              >
                <div
                  className="h-36 w-full bg-cover bg-center bg-surface-card"
                  style={biz.cover_photo_url ? { backgroundImage: `url('${biz.cover_photo_url}')` } : {}}
                />
                <div className="p-4">
                  <p className="text-sm font-medium text-text-primary">{biz.name}</p>
                  <p className="mt-1 text-xs text-text-muted capitalize">{biz.category}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">
                      {startingPrice !== null ? `Rs. ${startingPrice}` : "View services"}
                    </span>
                    <span
                      style={{ backgroundColor: biz.accent_color }}
                      className="rounded-pill px-3 py-1.5 text-xs font-medium text-surface-black"
                    >
                      View
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
