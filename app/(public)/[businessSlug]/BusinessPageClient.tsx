"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { getSlotsForDate } from "./actions"

type Service = {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
}

type Business = {
  id: string
  name: string
  category: string
  accent_color: string
  logo_url: string | null
  cover_photo_url: string | null
}

function getNextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function groupSlots(slots: string[]) {
  const morning = slots.filter((s) => Number(s.split(":")[0]) < 12)
  const afternoon = slots.filter((s) => {
    const h = Number(s.split(":")[0])
    return h >= 12 && h < 17
  })
  const night = slots.filter((s) => Number(s.split(":")[0]) >= 17)
  return { morning, afternoon, night }
}

export default function BusinessPageClient({ business, services }: { business: Business; services: Service[] }) {
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] ?? null)
  const [dateOffset, setDateOffset] = useState(0)
  const days = getNextDays(14)
  const visibleDays = days.slice(dateOffset, dateOffset + 5)
  const [selectedDate, setSelectedDate] = useState(days[0])
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState("")
  const [reserveSuccess, setReserveSuccess] = useState(false)

  useEffect(() => {
    if (!selectedService) return
    setLoadingSlots(true)
    setSelectedSlot(null)
    getSlotsForDate(selectedService.id, formatDateKey(selectedDate))
      .then(setSlots)
      .finally(() => setLoadingSlots(false))
  }, [selectedService, selectedDate])

  async function handleReserve() {
    if (!selectedService || !selectedSlot) return
    setReserving(true)
    setReserveError("")

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          bookingDate: formatDateKey(selectedDate),
          startTime: selectedSlot,
        }),
      })

      const data = await res.json()

      if (res.status === 401) {
        window.location.href = `/login?redirect=/${window.location.pathname.split("/").pop()}`
        return
      }

      if (!res.ok) {
        setReserveError(data.error ?? "Booking nahi ho payi, dobara try karo")
        return
      }

      setReserveSuccess(true)
      setSelectedSlot(null)
      getSlotsForDate(selectedService.id, formatDateKey(selectedDate)).then(setSlots)
    } catch {
      setReserveError("Kuch ghalat ho gaya, dobara try karo")
    } finally {
      setReserving(false)
    }
  }

  const { morning, afternoon, night } = groupSlots(slots)
  const accentColor = business.accent_color

  return (
    <div className="min-h-screen bg-surface-black pb-32">
      <div className="relative h-48 bg-surface-card">
        {business.cover_photo_url && (
          <img src={business.cover_photo_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute -bottom-8 left-6 h-16 w-16 rounded-2xl bg-surface-card border-4 border-surface-black overflow-hidden">
          {business.logo_url && <img src={business.logo_url} alt="" className="w-full h-full object-cover" />}
        </div>
      </div>

      <div className="px-6 pt-12">
        <h1 className="font-display text-2xl font-semibold text-text-primary">{business.name}</h1>
        <p className="text-text-muted text-sm capitalize mt-0.5">{business.category}</p>

        <h2 className="font-display text-lg font-medium text-text-primary mt-8 mb-3">Services</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              style={
                selectedService?.id === service.id
                  ? { borderColor: accentColor, backgroundColor: `${accentColor}1A` }
                  : {}
              }
              className={`flex-shrink-0 w-48 rounded-2xl border p-4 text-left ${
                selectedService?.id === service.id ? "" : "border-white/10 bg-surface-card"
              }`}
            >
              <h3 className="text-text-primary font-medium text-sm">{service.name}</h3>
              <p className="text-text-muted text-xs mt-1 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-text-muted text-xs flex items-center gap-1">
                  <Clock size={11} />
                  {service.duration_minutes} min
                </span>
                <span style={{ color: accentColor }} className="text-sm font-medium">
                  Rs. {service.price}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedService && (
          <>
            <h2 className="font-display text-lg font-medium text-text-primary mt-8 mb-3">Select Date</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateOffset(Math.max(0, dateOffset - 5))}
                disabled={dateOffset === 0}
                className="p-2 rounded-full bg-surface-card text-text-muted disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-2 overflow-x-auto">
                {visibleDays.map((day) => {
                  const isSelected = formatDateKey(day) === formatDateKey(selectedDate)
                  return (
                    <button
                      key={formatDateKey(day)}
                      onClick={() => setSelectedDate(day)}
                      style={isSelected ? { backgroundColor: accentColor } : {}}
                      className={`flex-shrink-0 w-14 rounded-xl py-2.5 text-center ${
                        isSelected ? "" : "bg-surface-card"
                      }`}
                    >
                      <div className={`text-xs ${isSelected ? "text-surface-black" : "text-text-muted"}`}>
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          isSelected ? "text-surface-black" : "text-text-primary"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setDateOffset(Math.min(days.length - 5, dateOffset + 5))}
                disabled={dateOffset >= days.length - 5}
                className="p-2 rounded-full bg-surface-card text-text-muted disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <h2 className="font-display text-lg font-medium text-text-primary mt-8 mb-3">Select Time</h2>

            {loadingSlots && <p className="text-text-muted text-sm">Slots load ho rahe hain...</p>}

            {!loadingSlots && slots.length === 0 && (
              <p className="text-text-muted text-sm">Is din koi slot available nahi hai.</p>
            )}

            {!loadingSlots && slots.length > 0 && (
              <div className="flex flex-col gap-4">
                {morning.length > 0 && (
                  <SlotGroup
                    label="Morning"
                    slots={morning}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                    accentColor={accentColor}
                  />
                )}
                {afternoon.length > 0 && (
                  <SlotGroup
                    label="Afternoon"
                    slots={afternoon}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                    accentColor={accentColor}
                  />
                )}
                {night.length > 0 && (
                  <SlotGroup
                    label="Night"
                    slots={night}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                    accentColor={accentColor}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedService && selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary text-sm font-medium">{selectedService.name}</p>
              <p className="text-text-muted text-xs">
                {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                {selectedSlot}
              </p>
            </div>
            <button
              onClick={handleReserve}
              disabled={reserving}
              style={{ backgroundColor: accentColor }}
              className="rounded-full px-6 py-3 text-sm font-medium text-surface-black disabled:opacity-60"
            >
              {reserving ? "Booking..." : "Reserve"}
            </button>
          </div>
          {reserveError && <p className="text-red-400 text-xs mt-2">{reserveError}</p>}
        </div>
      )}

      {reserveSuccess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
          <div className="bg-surface-card rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-text-primary font-medium mb-1">Booking request bhej di gayi!</p>
            <p className="text-text-muted text-sm mb-4">Owner approve karega toh confirmation mil jayegi.</p>
            <button
              onClick={() => setReserveSuccess(false)}
              style={{ backgroundColor: accentColor }}
              className="rounded-full px-6 py-2.5 text-sm font-medium text-surface-black"
            >
              Theek hai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SlotGroup({
  label,
  slots,
  selectedSlot,
  onSelect,
  accentColor,
}: {
  label: string
  slots: string[]
  selectedSlot: string | null
  onSelect: (slot: string) => void
  accentColor: string
}) {
  return (
    <div>
      <p className="text-text-muted text-xs mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            style={selectedSlot === slot ? { backgroundColor: accentColor } : {}}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedSlot === slot ? "text-surface-black font-medium" : "bg-surface-card text-text-primary"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}
