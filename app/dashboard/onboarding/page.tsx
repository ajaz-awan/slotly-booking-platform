"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/ui/Navbar";
import { sendBusinessEmailOtp, verifyBusinessEmailAndCreate } from "./actions";

const CATEGORIES = ["Salon", "Barbershop", "Clinic", "Tutor", "Spa"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function OnboardingPage() {
  const router = useRouter();

  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
    });
  }, []);

  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accentColor, setAccentColor] = useState("#F5C518");
  const [slugTouched, setSlugTouched] = useState(false);
  const [businessEmail, setBusinessEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendBusinessEmailOtp(businessEmail);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setStep("otp");
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyBusinessEmailAndCreate({
      email: businessEmail,
      token: otp,
      name,
      slug,
      category,
      accentColor,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleResend() {
    setError("");
    const result = await sendBusinessEmailOtp(businessEmail);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-surface-black">
      <Navbar showSearch={false} isSignedIn={isSignedIn} />

      <div className="mx-auto max-w-lg px-6 py-16">
        {step === "form" ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Set up your business
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              This takes a minute — you can change everything later.
            </p>

            <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
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

              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Business email
                </label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  required
                  className="w-full rounded-card border border-surface-border bg-surface-card px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                  placeholder="business@example.com"
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  We'll send a verification code here.
                </p>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-pill bg-accent text-surface-black font-medium py-3 hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Enter the code sent to {businessEmail}
            </p>

            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Verification code
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={8}
                  className="w-full rounded-card border border-surface-border bg-surface-card px-4 py-2.5 text-text-primary tracking-[0.5em] text-center focus:outline-none focus:border-accent"
                  placeholder="000000"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-pill bg-accent text-surface-black font-medium py-3 hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & create business"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className="w-full text-sm text-text-muted hover:text-text-primary"
              >
                Resend code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}