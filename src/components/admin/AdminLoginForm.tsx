"use client"

import { useActionState } from "react"
import { loginAdmin } from "@/lib/actions/admin"
import { ShieldCheck } from "lucide-react"

export function AdminLoginForm() {
  const [state, action, isPending] = useActionState(loginAdmin, null)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-pine)] mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-[22px] font-black text-gray-900">painel administrativo</h1>
          <p className="text-[13px] text-gray-500 mt-1">kloop — acesso restrito à equipe</p>
        </div>

        <form action={action} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {state?.error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[13px] text-red-600 font-medium">{state.error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-[12px] font-bold text-gray-600 mb-1.5">
              usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] focus:border-transparent"
              placeholder="usuário admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12px] font-bold text-gray-600 mb-1.5">
              senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-[var(--color-pine)] text-white rounded-xl font-black text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "entrando..." : "entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
