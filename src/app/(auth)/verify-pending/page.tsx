import { Suspense } from "react"
import VerifyPendingContent from "./VerifyPendingContent"

export default function VerifyPendingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-linen p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <div className="mb-4 text-5xl">✉️</div>
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    }>
      <VerifyPendingContent />
    </Suspense>
  )
}
