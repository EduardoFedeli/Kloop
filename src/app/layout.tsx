import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Image from "next/image"
import { Toaster } from "sonner"
import { BackgroundPattern } from "@/components/layout/BackgroundPattern"
import { SplashScreenController } from "@/components/layout/SplashScreenController"
import "./globals.css";// <-- Import alterado usando o alias do Next.js

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Kloop",
  description: "Marketplace consolidador de desapegos. Mobile-first, mercado brasileiro de seminovos.",
}

// Decide antes da 1ª pintura (sem esperar o React hidratar) se a splash deve
// aparecer: só em viewport mobile e só se o usuário nunca tiver visto antes.
// Evita o "flash" do app por trás da splash em visitas recorrentes/desktop.
const SPLASH_GUARD_SCRIPT = `
(function () {
  try {
    var isMobile = window.matchMedia('(max-width: 767px)').matches;
    var seen = localStorage.getItem('kloop-splash-seen') === '1';
    if (!isMobile || seen) {
      document.documentElement.classList.add('kloop-splash-skip');
    }
  } catch (e) {
    document.documentElement.classList.add('kloop-splash-skip');
  }
})();
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_GUARD_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div
          id="kloop-splash"
          aria-hidden="true"
          className="fixed inset-0 z-999 flex items-center justify-center bg-forest"
        >
          <Image
            src="/icons/icon-512.png"
            alt=""
            width={112}
            height={112}
            priority
            className="rounded-3xl shadow-2xl"
          />
        </div>
        <SplashScreenController />
        <BackgroundPattern />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}