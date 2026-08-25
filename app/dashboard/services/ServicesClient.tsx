"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Clock, X } from "lucide-react"
import { createService, updateService, deleteService, toggleServiceActive } from "./actions"

type Service = {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

export default function ServicesClient({
  initialServices,
  accentColor,
}: {
  initialServices: Service[]
  accentColor: string
}) {
  const [services, setServices] = useState(initialServices)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  function openCreate() {
    setEditingService(null)
    setShowForm(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setShowForm(true)
  }

  async function handleToggle(service: Service) {
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
    )
    await toggleServiceActive(service.id, !service.is_active)
  }

  async function handleDelete(id: string) {
    await deleteService(id)
    setServices((prev) => prev.filter((s) => s.id !== id))
    setPendingDelete(null)
  }

  return (
    <div className="min-h-screen bg-surface-black px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display italic text-2xl font-medium text-text-primary">Services</h1>
          <button
            onClick={openCreate}
            style={{ backgroundColor: accentColor }}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-surface-black"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        {services.length === 0 && (
          <p className="text-text-muted text-sm">
            Abhi tak koi service add nahi hui. "Add Service" pe click karke shuru karo.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-card bg-surface-card px-5 py-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-primary">{service.name}</h3>
                  {!service.is_active && (
                    <span className="text-xs text-text-muted bg-surface-black px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted mt-1 line-clamp-1">{service.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {service.duration_minutes} min
                  </span>
                  <span style={{ color: accentColor }} className="font-medium">
                    Rs. {service.price}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(service)}
                  className="text-xs text-text-muted hover:text-text-primary px-2"
                >
                  {service.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => openEdit(service)}
                  className="p-2 rounded-full hover:bg-surface-black text-text-muted"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setPendingDelete(service.id)}
                  className="p-2 rounded-full hover:bg-surface-black text-text-muted"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <ServiceFormModal
          accentColor={accentColor}
          service={editingService}
          onClose={() => setShowForm(false)}
          onCreated={(newService) => setServices((prev) => [newService, ...prev])}
          onUpdated={(updated) =>
            setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
          }
        />
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
          <div className="bg-surface-card rounded-card p-6 max-w-sm w-full">
            <p className="text-text-primary mb-4">Ye service delete karni hai? Ye undo nahi ho sakta.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="text-text-muted text-sm px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(pendingDelete)}
                className="text-sm px-3 py-2 rounded-full bg-red-500/20 text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceFormModal({
  accentColor,
  service,
  onClose,
  onCreated,
  onUpdated,
}: {
  accentColor: string
  service: Service | null
  onClose: () => void
  onCreated: (s: Service) => void
  onUpdated: (s: Service) => void
}) {
  const [name, setName] = useState(service?.name ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [duration, setDuration] = useState(service?.duration_minutes ?? 30)
  const [price, setPrice] = useState(service ? String(service.price) : "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handlePriceChange(raw: string) {
    const cleaned = raw.replace(/^0+(?=\d)/, "")
    if (cleaned === "" || /^\d*\.?\d*$/.test(cleaned)) {
      setPrice(cleaned)
    }
  }

  async function handleSubmit() {
    const numericPrice = price === "" ? 0 : Number(price)
    if (!name.trim() || duration <= 0 || numericPrice < 0) {
      setError("Sahi values daalo — name khali nahi ho sakta, duration 0 se zyada honi chahiye.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const input = { name, description, duration_minutes: duration, price: numericPrice }
      if (service) {
        await updateService(service.id, input)
        onUpdated({ ...service, ...input })
      } else {
        await createService(input)
        onCreated({
          id: crypto.randomUUID(),
          is_active: true,
          ...input,
        })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kuch ghalat ho gaya")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
      <div className="bg-surface-card rounded-card p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display italic text-lg font-medium text-text-primary">
            {service ? "Edit Service" : "New Service"}
          </h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            className="bg-surface-black rounded-card px-4 py-3 text-text-primary text-sm outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="bg-surface-black rounded-card px-4 py-3 text-text-primary text-sm outline-none resize-none"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-text-muted">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-surface-black rounded-card px-4 py-3 text-text-primary text-sm outline-none mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-muted">Price (Rs.)</label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-black rounded-card px-4 py-3 text-text-primary text-sm outline-none mt-1"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ backgroundColor: accentColor }}
            className="rounded-full py-3 text-sm font-medium text-surface-black mt-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : service ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  )
}