"use client"

import { useEffect } from "react"

const STORAGE_KEY = "kloop-splash-seen"
const HOLD_MS = 1300
const FADE_MS = 350

export function SplashScreenController() {
  useEffect(() => {
    if (document.documentElement.classList.contains("kloop-splash-skip")) {
      return
    }

    const splash = document.getElementById("kloop-splash")
    if (!splash) return

    const fadeTimer = setTimeout(() => {
      splash.classList.add("kloop-splash-out")
    }, HOLD_MS)

    const removeTimer = setTimeout(() => {
      splash.remove()
      try {
        localStorage.setItem(STORAGE_KEY, "1")
      } catch {
        // localStorage indisponível (modo privado, etc.) — segue sem persistir
      }
    }, HOLD_MS + FADE_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return null
}
