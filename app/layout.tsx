import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://slotly-booking-platform.vercel.app"),
  title: "Slotly — Book Appointments in Seconds",
  description:
    "Multi-tenant appointment booking for salons, clinics, and tutors. Find a business, check live availability, and book instantly.",
  openGraph: {
    title: "Slotly — Book Appointments in Seconds",
    description:
      "Multi-tenant appointment booking for salons, clinics, and tutors. Find a business, check live availability, and book instantly.",
    url: "https://slotly-booking-platform.vercel.app",
    siteName: "Slotly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Slotly — Book your next appointment in seconds",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slotly — Book Appointments in Seconds",
    description:
      "Multi-tenant appointment booking for salons, clinics, and tutors.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
