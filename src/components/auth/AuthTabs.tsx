"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validators/auth"

interface AuthTabsProps {
  defaultTab?: "login" | "register"
  onLoginSuccess?: () => void
}

function PasswordChecklist({ password }: { password: string }) {
  const checks = [
    { label: "pelo menos 8 caracteres", valid: password.length >= 8 },
    { label: "pelo menos 1 letra", valid: /[a-zA-Z]/.test(password) },
    { label: "pelo menos 1 número", valid: /\d/.test(password) },
  ]

  if (!password) return null

  return (
    <ul className="mt-1.5 flex flex-col gap-0.5">
      {checks.map((check) => (
        <li
          key={check.label}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            check.valid ? "text-teal" : "text-gray-400"
          )}
        >
          <span>{check.valid ? "✓" : "○"}</span>
          {check.label}
        </li>
      ))}
    </ul>
  )
}

function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<"credentials" | "not_verified" | null>(null)
  const [resendEmail, setResendEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    setResendEmail(data.email)

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (!res?.error) {
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        const redirectTo = searchParams.get("redirectTo") || "/"
        router.push(redirectTo)
      }
      return
    }

    if (res.error === "AccessDenied") {
      setServerError("not_verified")
    } else {
      setServerError("credentials")
    }
  }

  async function handleResend() {
    if (!resendEmail) return
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError === "not_verified" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <p className="font-medium">
            sua conta ainda não foi verificada. verifique seu email ou clique para reenviar.
          </p>
          <button
            type="button"
            onClick={handleResend}
            className="mt-1 text-xs font-bold text-amber-700 underline hover:no-underline"
          >
            reenviar email de verificação
          </button>
        </div>
      )}

      {serverError === "credentials" && (
        <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm font-medium text-red-500">
          email ou senha incorretos
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-airforce">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.email
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-semibold text-airforce">
            Senha
          </label>
          <button type="button" className="text-xs font-medium text-teal hover:underline">
            Esqueci a senha
          </button>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="Sua senha"
          {...register("password")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.password
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch("password") ?? ""

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error ?? "não foi possível criar sua conta")
      return
    }

    const redirectTo = searchParams.get("redirectTo")
    const verifyPendingUrl = `/verify-pending?email=${encodeURIComponent(data.email)}${
      redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
    }`
    router.push(verifyPendingUrl)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm font-medium text-red-500">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-sm font-semibold text-airforce">
          Nome completo
        </label>
        <input
          id="reg-name"
          type="text"
          placeholder="Ex: João da Silva"
          {...register("name")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.name
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-semibold text-airforce">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.email
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-semibold text-airforce">
          Senha
        </label>
        <input
          id="reg-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.password
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        <PasswordChecklist password={passwordValue} />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm" className="text-sm font-semibold text-airforce">
          Confirmar senha
        </label>
        <input
          id="reg-confirm"
          type="password"
          placeholder="Repita sua senha"
          {...register("confirmPassword")}
          className={cn(
            "rounded-lg border bg-linen p-3 text-sm text-airforce placeholder:text-gray-400 outline-none transition-colors focus:ring-1",
            errors.confirmPassword
              ? "border-red-400 focus:border-red-400 focus:ring-red-400"
              : "border-teal-muted/40 focus:border-teal focus:ring-teal"
          )}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
      >
        {isSubmitting ? "Criando..." : "Criar conta"}
      </button>
    </form>
  )
}

export function AuthTabs({ defaultTab = "login", onLoginSuccess }: AuthTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const isModal = !!onLoginSuccess

  function switchTab(newTab: "login" | "register") {
    setTab(newTab)
    // No modal context, don't touch the URL — the modal overlays the current page
    if (isModal) return
    const redirectTo = searchParams.get("redirectTo")
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""
    router.replace(
      newTab === "login" ? `/login${params}` : `/register${params}`,
      { scroll: false }
    )
  }

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b border-gray-100">
        <button
          type="button"
          onClick={() => switchTab("login")}
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
          onClick={() => switchTab("register")}
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

      {tab === "login" ? (
        <LoginForm onLoginSuccess={onLoginSuccess} />
      ) : (
        <RegisterForm />
      )}

      <div className="my-6 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">ou</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google")}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-bold text-airforce transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Entrar com Google
      </button>
    </div>
  )
}
