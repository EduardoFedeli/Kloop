"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Email ou senha incorretos.")
      } else {
        onClose()
        window.location.reload()
      }
    } catch (err) {
      setError("Erro ao fazer login.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.")
        return
      }

      await signIn("credentials", { email, password, redirect: false })
      onClose()
      window.location.reload()
    } catch (err) {
      setError("Erro ao criar conta.")
    } finally {
      setIsLoading(false)
    }
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

        <div className="mb-6 flex gap-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={cn(
              "pb-2 text-sm font-bold transition-colors",
              tab === "login"
                ? "border-b-2 border-teal text-teal"
                : "text-gray-400 hover:text-airforce"
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={cn(
              "pb-2 text-sm font-bold transition-colors",
              tab === "register"
                ? "border-b-2 border-teal text-teal"
                : "text-gray-400 hover:text-airforce"
            )}
          >
            Criar conta
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-500 border border-red-100">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold text-airforce">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-semibold text-airforce">Senha</label>
                <button type="button" className="text-xs font-medium text-teal hover:underline">Esqueci a senha</button>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="Sua senha"
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-name" className="text-sm font-semibold text-airforce">Nome completo</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                placeholder="Ex: João da Silva"
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold text-airforce">Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-airforce">Senha</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm" className="text-sm font-semibold text-airforce">Confirmar senha</label>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                required
                placeholder="Repita sua senha"
                minLength={6}
                className="rounded-lg border border-teal-muted/40 bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
            >
              {isLoading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-100"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">ou</span>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-bold text-airforce transition-colors hover:bg-gray-50 hover:border-gray-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  )
}