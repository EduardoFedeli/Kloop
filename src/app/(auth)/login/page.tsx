import { Suspense } from "react"
import { AuthTabs } from "@/components/auth/AuthTabs"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linen p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <Suspense>
          <AuthTabs defaultTab="login" />
        </Suspense>
      </div>
    </div>
  )
}
