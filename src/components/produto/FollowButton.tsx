"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { toggleFollow } from "@/app/actions/interacoes"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  targetId: string
  targetType: "USER" | "BRAND"
  initialIsFollowing?: boolean
}

export function FollowButton({ targetId, targetType, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleFollow = () => {
    // UI Otimista: muda na hora
    setIsFollowing(!isFollowing)

    startTransition(async () => {
      try {
        const result = await toggleFollow(targetId, targetType)
        setIsFollowing(result.following) // Garante o estado real do banco
        
        if (result.following) {
          toast.success(targetType === "USER" ? "Você agora segue esta loja!" : "Você agora segue esta marca!")
        } else {
          toast.info("Você deixou de seguir.")
        }
      } catch (error) {
        // Se der erro, reverte
        setIsFollowing(isFollowing)
        toast.error("Faça login para seguir lojas e marcas.")
      }
    })
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={cn(
        "text-[13px] font-bold border rounded-full px-4 py-1.5 transition disabled:opacity-50",
        isFollowing
          ? "bg-[var(--color-pine)] text-white border-[var(--color-pine)] dark:bg-white dark:text-[var(--color-pine)] dark:border-white"
          : "text-[var(--color-pine)] border-[var(--color-pine)] dark:text-white dark:border-white hover:bg-gray-50 dark:hover:bg-white/5"
      )}
    >
      {isFollowing ? "seguindo" : "seguir"}
    </button>
  )
}