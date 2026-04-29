"use client"

import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { AuthTabs } from "@/components/auth/AuthTabs"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  function handleLoginSuccess() {
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          aria-label="Fechar modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-airforce"
        >
          <X className="h-5 w-5" />
        </button>

        <AuthTabs defaultTab="login" onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}