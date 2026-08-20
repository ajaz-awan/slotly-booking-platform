'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, Settings } from 'lucide-react';

type NavbarProps = {
  
  businessName?: string;
  /** Business logo URL — shown next to businessName when provided. */
  businessLogoUrl?: string;
  
  isSignedIn?: boolean;
  
  showSearch?: boolean;
};

export default function Navbar({
  businessName,
  businessLogoUrl,
  isSignedIn = false,
  showSearch = true,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Left: logo / business identity */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {businessLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={businessLogoUrl}
              alt={businessName ?? 'Business logo'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="h-8 w-8 rounded-full bg-accent" aria-hidden />
          )}
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            {businessName ?? 'Slotly'}
          </span>
        </Link>

        {/* Center: search bar (desktop only, matches reference design) */}
        {showSearch && (
          <div className="hidden flex-1 items-center gap-2 rounded-pill bg-surface-card px-4 py-2.5 md:flex">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search services or businesses..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        )}

        {/* Right: auth action (desktop) */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard/settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-text-primary hover:bg-surface-card-hover"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-text-primary hover:bg-surface-card-hover"
              >
                <User className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-pill bg-accent px-5 py-2 text-sm font-medium text-surface-black hover:bg-accent-hover"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-text-primary md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-surface-border bg-surface-black px-4 py-4 md:hidden">
          {showSearch && (
            <div className="mb-4 flex items-center gap-2 rounded-pill bg-surface-card px-4 py-2.5">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search services or businesses..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          )}

          {isSignedIn ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="block rounded-pill bg-surface-card px-4 py-2.5 text-center text-sm font-medium text-text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="block rounded-pill bg-surface-card px-4 py-2.5 text-center text-sm font-medium text-text-primary"
              >
                Settings
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="block rounded-pill bg-accent px-4 py-2.5 text-center text-sm font-medium text-surface-black"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}