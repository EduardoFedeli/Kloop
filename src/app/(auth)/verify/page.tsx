import Link from "next/link"
import { verifyToken } from "@/lib/auth/verify-token"

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams

  if (!token) {
    return <VerifyResult status="invalid" />
  }

  const result = await verifyToken(token)
  return <VerifyResult status={result.status} />
}

function VerifyResult({ status }: { status: "success" | "expired" | "invalid" }) {
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-2 text-xl font-bold text-airforce">Email confirmado!</h1>
          <p className="mb-8 text-sm text-gray-500">
            Sua conta está ativa. agora você pode entrar no Kloop.
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90"
          >
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  if (status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">⏰</div>
          <h1 className="mb-2 text-xl font-bold text-airforce">Link expirado</h1>
          <p className="mb-8 text-sm text-gray-500">
            o link de verificação expirou. clique para receber um novo.
          </p>
          <Link
            href="/verify-pending"
            className="inline-block w-full rounded-lg bg-teal p-3 text-sm font-bold text-white transition-colors hover:bg-teal/90"
          >
            Receber novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h1 className="mb-2 text-xl font-bold text-airforce">Link inválido</h1>
        <p className="mb-8 text-sm text-gray-500">link inválido ou já utilizado.</p>
        <Link
          href="/login"
          className="inline-block w-full rounded-lg border border-teal p-3 text-sm font-bold text-teal transition-colors hover:bg-teal/5"
        >
          Voltar para login
        </Link>
      </div>
    </div>
  )
}
