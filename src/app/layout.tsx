import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "SafariPlus - East African Safari Tours & Experiences",
    template: "%s | SafariPlus",
  },
  description:
    "Discover unforgettable East African safari adventures. Book authentic tours with verified local operators in Kenya, Tanzania, Uganda, and Rwanda.",
  keywords: [
    "safari",
    "East Africa",
    "Kenya safari",
    "Tanzania tours",
    "gorilla trekking",
    "Serengeti",
    "Masai Mara",
    "wildlife tours",
    "African adventure",
  ],
  authors: [{ name: "SafariPlus" }],
  creator: "SafariPlus",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://safariplus.com",
    siteName: "SafariPlus",
    title: "SafariPlus - East African Safari Tours & Experiences",
    description:
      "Discover unforgettable East African safari adventures. Book authentic tours with verified local operators.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SafariPlus - East African Safari Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafariPlus - East African Safari Tours & Experiences",
    description:
      "Discover unforgettable East African safari adventures with verified local operators.",
    images: ["/og-image.jpg"],
    creator: "@safariplus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
