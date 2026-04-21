import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/verify-token"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const result = await verifyToken(token)

  if (result.status === "invalid") {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  if (result.status === "expired") {
    return NextResponse.json({ error: "expired" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
