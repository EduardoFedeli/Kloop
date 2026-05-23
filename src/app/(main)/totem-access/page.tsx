'use client'

import { useState } from 'react'
import { Monitor, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TotemAccessPage() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/totem/auth/by-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numericCode: code }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json() as { error?: string }
        setErrorMsg(data.error ?? 'Erro ao validar código')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
    if (status === 'error') {
      setStatus('idle')
      setErrorMsg('')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-linen)] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[var(--color-teal)]" />
          <h1 className="mb-2 text-xl font-bold text-[var(--color-forest)]">
            Acesso liberado!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            O totem reconheceu seu login. Você já pode continuar navegando por lá.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-[var(--color-teal)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-airforce)] transition-colors"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-linen)] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-airforce)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-frosted)]">
            <Monitor className="h-7 w-7 text-[var(--color-airforce)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-forest)]">Acesso ao totem</h1>
          <p className="mt-1 text-sm text-gray-500">
            Digite o código de 6 dígitos exibido na tela do totem para entrar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-[var(--color-forest)] outline-none focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-teal)]/20 transition-all"
            autoFocus
          />

          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={code.length !== 6 || status === 'loading'}
            className="rounded-full bg-[var(--color-airforce)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-emerald)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? 'Validando...' : 'Confirmar acesso'}
          </button>
        </form>
      </div>
    </div>
  )
}
