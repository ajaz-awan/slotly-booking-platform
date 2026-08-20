"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/ui/Navbar";

const CATEGORIES = ["Salon", "Barbershop", "Clinic", "Tutor", "Spa"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accentColor, setAccentColor] = useState("#F5C518");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name,
      slug,
      category,
      accent_color: accentColor,
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "That URL is already taken, try a different name."
          : insertError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface-black">
      <Navbar showSearch={false} />

      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Set up your business
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          This takes a minute — you can change everything later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">
              Business name
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full rounded-card border border-surface-border bg-surface-card px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
              placeholder="Hair & Beauty Studio"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">
              Booking page URL
            </label>
            <div className="flex items-center rounded-card border border-surface-border bg-surface-card px-4 py-2.5">
              <span className="text-text-muted text-sm">slotly.app/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                required
                className="flex-1 bg-transparent text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-card border border-surface-border bg-surface-card px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">
              Accent color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-14 rounded-card border border-surface-border bg-surface-card cursor-pointer"
              />
              <span className="text-sm text-text-muted">{accentColor}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-pill bg-accent text-surface-black font-medium py-3 hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create business"}
          </button>
        </form>
      </div>
    </div>
  );
}
