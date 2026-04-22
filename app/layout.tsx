import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "MediRefer | Digital Referral & Transfer Management",
  description: "Rwanda's digital platform for fast, safe patient transfers between district and referral hospitals — in real-time.",
  generator: "MediRefer",
  keywords: ["patient referral", "hospital transfer", "Rwanda healthcare", "digital health", "referral management"],
  authors: [{ name: "MediRefer · Ministry of Health, Rwanda" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
