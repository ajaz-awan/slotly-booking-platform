"use client"

import { useState, useRef } from "react"
import { Camera, Loader2, Mail } from "lucide-react"
import { updateBusinessImages, updateAccountEmail } from "./actions"

type Business = {
  id: string
  name: string
  accent_color: string
  logo_url: string | null
  cover_photo_url: string | null
}

export default function SettingsClient({
  business,
  currentEmail,
}: {
  business: Business
  currentEmail: string
}) {
  const [logoPreview, setLogoPreview] = useState(business.logo_url)
  const [coverPreview, setCoverPreview] = useState(business.cover_photo_url)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [imageError, setImageError] = useState("")
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
  const MAX_BYTES = 4 * 1024 * 1024

  function validateImage(file: File, label: string) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError(`${label} sirf JPG, PNG ya WEBP honi chahiye`)
      return false
    }
    if (file.size > MAX_BYTES) {
      setImageError(`${label} ka size 4MB se kam honi chahiye`)
      return false
    }
    setImageError("")
    return true
  }

  const [email, setEmail] = useState(currentEmail)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMessage, setEmailMessage] = useState("")
  const [emailError, setEmailError] = useState("")

  function handlePreview(file: File, setPreview: (url: string) => void) {
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(formData: FormData) {
    if (imageError) return
    setSaving(true)
    setSaved(false)
    formData.set("businessId", business.id)
    try {
      await updateBusinessImages(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Photo save nahi ho payi")
    } finally {
      setSaving(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email === currentEmail) return
    setEmailSaving(true)
    setEmailError("")
    setEmailMessage("")
    try {
      await updateAccountEmail(email)
      setEmailMessage("Confirmation link dono emails pe bhej di gayi hai — nayi email confirm karke change complete karo.")
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Email update nahi ho payi")
    } finally {
      setEmailSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-black px-6 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display italic text-2xl font-medium text-text-primary mb-1">Settings</h1>
        <p className="text-text-muted text-sm mb-8">Apna business aur account yahan se manage karo</p>

        <div className="rounded-card bg-surface-card border border-white/10 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={16} className="text-text-muted" />
            <p className="text-text-primary text-sm font-medium">Account Email</p>
          </div>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-surface-black rounded-card px-4 py-2.5 text-text-primary text-sm outline-none border border-white/10 focus:border-accent"
            />
            <button
              type="submit"
              disabled={emailSaving || email === currentEmail}
              style={{ backgroundColor: business.accent_color }}
              className="rounded-pill px-5 py-2.5 text-sm font-medium text-surface-black disabled:opacity-50 shrink-0"
            >
              {emailSaving ? "Sending..." : "Update Email"}
            </button>
          </form>
          {emailMessage && <p className="text-sm text-text-muted mt-3">{emailMessage}</p>}
          {emailError && <p className="text-sm text-red-400 mt-3">{emailError}</p>}
        </div>

        <form action={handleSubmit} className="flex flex-col gap-8">
          <p className="text-text-primary text-sm font-medium -mb-4">Business Branding</p>
          <div>
            <p className="text-text-primary text-sm font-medium mb-3">Cover Photo</p>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-40 rounded-card bg-surface-card border border-white/10 overflow-hidden cursor-pointer group"
            >
              {coverPreview && (
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-text-primary" />
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              name="cover"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && validateImage(file, "Cover photo")) handlePreview(file, setCoverPreview)
              }}
            />
          </div>

          <div>
            <p className="text-text-primary text-sm font-medium mb-3">Logo</p>
            <div
              onClick={() => logoInputRef.current?.click()}
              className="relative h-24 w-24 rounded-card bg-surface-card border border-white/10 overflow-hidden cursor-pointer group"
            >
              {logoPreview && (
                <img src={logoPreview} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} className="text-text-primary" />
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              name="logo"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && validateImage(file, "Logo")) handlePreview(file, setLogoPreview)
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || !!imageError}
                style={{ backgroundColor: business.accent_color }}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-surface-black disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Save ho raha hai..." : "Save Changes"}
              </button>
              {saved && <span className="text-sm text-text-muted">Saved ✓</span>}
            </div>
            {imageError && <p className="text-sm text-red-400">{imageError}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}