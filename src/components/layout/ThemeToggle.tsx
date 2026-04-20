"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "p-2 rounded-full transition-colors",
        "text-gray-500 hover:text-teal hover:bg-gray-100",
        "dark:text-sage dark:hover:text-celadon dark:hover:bg-emerald",
        className,
      )}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
