import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { BackgroundPattern } from "@/components/layout/BackgroundPattern"
import "./globals.css";// <-- Import alterado usando o alias do Next.js

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Kloop",
  description: "Marketplace consolidador de desapegos. Mobile-first, mercado brasileiro de seminovos.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <BackgroundPattern />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}