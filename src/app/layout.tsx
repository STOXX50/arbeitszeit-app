import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arbeitszeit Rechner | Präzise Zeiterfassung nach deutschem Arbeitsrecht",
  description: "Berechnen Sie Ihre Arbeitszeiten einfach und präzise. Automatische Pausenzeiten nach deutschem Arbeitsschutzgesetz, Mehrstunden-Berechnung und Dark Mode. Kostenlos und ohne Anmeldung.",
  keywords: ["Arbeitszeit", "Zeitrechner", "Pausenzeiten", "Mehrstunden", "Arbeitsrecht", "Deutschland", "Zeiterfassung"],
  authors: [{ name: "STOXX50" }],
  creator: "STOXX50",
  publisher: "STOXX50",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Arbeitszeit Rechner",
    description: "Berechnen Sie Ihre Arbeitszeiten einfach und präzise",
    type: "website",
    locale: "de_DE",
    siteName: "Arbeitszeit Rechner"
  },
  twitter: {
    card: "summary_large_image",
    title: "Arbeitszeit Rechner",
    description: "Berechnen Sie Ihre Arbeitszeiten einfach und präzise"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Analytics nur in Production oder wenn explizit aktiviert */}
        {(process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') && (
          <Analytics />
        )}
        {(process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS === 'true') && (
          <SpeedInsights />
        )}
      </body>
    </html>
  );
}
