"use client"

import { useState } from "react"
import { Calendar, Clock, Mail, ChevronDown, Check, X } from "lucide-react"
import { updateBookingStatus } from "./actions"

type Booking = {
  id: string
  customer_name: string
  customer_email: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  services: { id: string; name: string; price: number; business_id: string } | { id: string; name: string; price: number; business_id: string }[]
}

type Filter = "upcoming" | "past" | "all"

function getServiceInfo(booking: Booking) {
  return Array.isArray(booking.services) ? booking.services[0] : booking.services
}

function statusStyles(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-500/15 text-green-400"
    case "cancelled":
      return "bg-red-500/15 text-red-400"
    case "completed":
      return "bg-blue-500/15 text-blue-400"
    case "pending":
      return "bg-amber-500/15 text-amber-400"
    default:
      return "bg-surface-black text-text-muted"
  }
}

export default function BookingsClient({
  initialBookings,
  accentColor,
}: {
  initialBookings: Booking[]
  accentColor: string
}) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<Filter>("upcoming")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return b.booking_date >= today
    if (filter === "past") return b.booking_date < today
    return true
  })

  const pendingCount = bookings.filter((b) => b.status === "pending").length

  async function handleStatusChange(id: string, status: "confirmed" | "cancelled" | "completed") {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    setOpenMenuId(null)
    setProcessingId(null)
    await updateBookingStatus(id, status)
  }

  async function handleDecision(id: string, status: "confirmed" | "cancelled") {
    setProcessingId(id)
    await handleStatusChange(id, status)
  }

  return (
    <div className="min-h-screen bg-surface-black px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="font-display italic text-2xl font-medium text-text-primary">Bookings</h1>
          {pendingCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {(["upcoming", "past", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filter === f ? { backgroundColor: accentColor, color: "#121212" } : {}}
              className={`px-4 py-1.5 rounded-full text-sm capitalize ${
                filter === f ? "" : "bg-surface-card text-text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-text-muted text-sm">Is filter mein koi booking nahi hai.</p>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((booking) => {
            const service = getServiceInfo(booking)
            const isPending = booking.status === "pending"
            return (
              <div key={booking.id} className="rounded-card bg-surface-card px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">{booking.customer_name}</h3>
                    <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                      <Mail size={12} />
                      {booking.customer_email}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyles(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {booking.booking_date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                  </span>
                  {service && (
                    <span style={{ color: accentColor }} className="font-medium">
                      {service.name} · Rs. {service.price}
                    </span>
                  )}
                </div>

                {isPending ? (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleDecision(booking.id, "confirmed")}
                      disabled={processingId === booking.id}
                      style={{ backgroundColor: accentColor }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#121212] disabled:opacity-50"
                    >
                      <Check size={13} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(booking.id, "cancelled")}
                      disabled={processingId === booking.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 disabled:opacity-50"
                    >
                      <X size={13} />
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-3">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
                    >
                      Update status
                      <ChevronDown size={12} />
                    </button>

                    {openMenuId === booking.id && (
                      <div className="absolute left-0 mt-1 bg-surface-black rounded-xl overflow-hidden border border-white/5 z-10">
                        {["confirmed", "completed", "cancelled"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(booking.id, s as "confirmed" | "cancelled" | "completed")}
                            className="block w-full text-left px-4 py-2 text-xs text-text-primary hover:bg-surface-card capitalize"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}