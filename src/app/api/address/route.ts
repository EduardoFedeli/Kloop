import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { addressSchema } from "@/lib/validators/address"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json() as unknown
    const data = addressSchema.parse(body)

    const zipCode = data.zipCode.replace(/\D/g, "")
    const existingCount = await db.address.count({ where: { userId: session.user.id } })

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: data.label,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state.toUpperCase(),
        zipCode,
        isDefault: existingCount === 0,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao salvar endereço" }, { status: 500 })
  }
}
