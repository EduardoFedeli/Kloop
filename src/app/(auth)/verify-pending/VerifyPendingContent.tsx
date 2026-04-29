"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function VerifyPendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "rate_limited" | "error">("idle")

  async function handleResend() {
    if (!email) return
    setStatus("loading")

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (res.status === 429) {
      setStatus("rate_limited")
      return
    }

    if (!res.ok) {
      setStatus("error")
      return
    }

    setStatus("sent")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">✉️</div>
        <h1 className="mb-2 text-xl font-bold text-airforce">Verifique seu email</h1>
        <p className="mb-1 text-sm text-gray-500">Enviamos um link de confirmação para:</p>
        {email && <p className="mb-6 font-semibold text-airforce">{email}</p>}
        <p className="mb-8 text-sm text-gray-500">
          Clique no link do email para ativar sua conta. O link expira em 24 horas.
        </p>

        {status === "sent" && (
          <div className="mb-4 rounded-md bg-teal/10 border border-teal/20 p-3 text-sm font-medium text-teal">
            novo email enviado! verifique sua caixa de entrada.
          </div>
        )}
        {status === "rate_limited" && (
          <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            muitas tentativas. aguarde 60 segundos.
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-500">
            não foi possível reenviar o email. tente novamente.
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={status === "loading" || status === "sent"}
          className="w-full rounded-lg border border-teal p-3 text-sm font-bold text-teal transition-colors hover:bg-teal/5 disabled:opacity-50"
        >
          {status === "loading" ? "Enviando..." : "Reenviar email de verificação"}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Já verificou?{" "}
          <Link href="/login" className="font-medium text-teal hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
