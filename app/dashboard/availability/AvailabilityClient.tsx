"use client"

import { useState } from "react"
import { saveAvailability } from "./actions"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type Rule = { day_of_week: number; start_time: string; end_time: string }
type DayState = { enabled: boolean; start_time: string; end_time: string }

function buildInitialState(rules: Rule[]): DayState[] {
  return DAYS.map((_, index) => {
    const existing = rules.find((r) => r.day_of_week === index)
    return existing
      ? { enabled: true, start_time: existing.start_time.slice(0, 5), end_time: existing.end_time.slice(0, 5) }
      : { enabled: false, start_time: "09:00", end_time: "17:00" }
  })
}

export default function AvailabilityClient({
  initialRules,
  accentColor,
}: {
  initialRules: Rule[]
  accentColor: string
}) {
  const [days, setDays] = useState<DayState[]>(buildInitialState(initialRules))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const rules = days.map((d, index) => ({ day_of_week: index, ...d }))
      await saveAvailability(rules)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save nahi hua, dobara try karo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-black px-6 py-8">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">Availability</h1>
        <p className="text-text-muted text-sm mb-6">
          Har din ke liye working hours set karo. Off days ko toggle off kar do.
        </p>

        <div className="flex flex-col gap-2">
          {DAYS.map((label, index) => {
            const day = days[index]
            return (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl bg-surface-card px-5 py-4"
              >
                <button
                  onClick={() => updateDay(index, { enabled: !day.enabled })}
                  style={{ backgroundColor: day.enabled ? accentColor : "#3A3A3A" }}
                  className="relative h-6 w-11 rounded-full flex-shrink-0 transition-colors"
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                    style={{ transform: day.enabled ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>

                <span className="text-text-primary text-sm w-24 flex-shrink-0">{label}</span>

                {day.enabled ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={(e) => updateDay(index, { start_time: e.target.value })}
                      className="bg-surface-black rounded-lg px-2 py-1.5 text-text-primary text-sm outline-none"
                    />
                    <span className="text-text-muted text-xs">to</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={(e) => updateDay(index, { end_time: e.target.value })}
                      className="bg-surface-black rounded-lg px-2 py-1.5 text-text-primary text-sm outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-text-muted text-xs ml-auto">Closed</span>
                )}
              </div>
            )
          })}
        </div>

        {error && <p className="text-red-400 text-xs mt-4">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: accentColor }}
          className="w-full rounded-full py-3 text-sm font-medium text-surface-black mt-6 disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Availability"}
        </button>
      </div>
    </div>
  )
}