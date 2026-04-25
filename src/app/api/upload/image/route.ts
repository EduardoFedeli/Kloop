import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo não permitido. Use JPEG, PNG ou WebP." },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo 5MB." },
      { status: 400 },
    )
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: "Falha ao ler arquivo" }, { status: 400 })
  }

  const folder = `kloop/listings/${session.user.id}/${Date.now()}`

  try {
    const result = await new Promise<{
      url: string
      publicId: string
      width: number
      height: number
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, res) => {
          if (error || !res) return reject(error ?? new Error("Upload falhou"))
          resolve({
            url: res.secure_url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
          })
        },
      )
      stream.end(buffer)
    })

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
