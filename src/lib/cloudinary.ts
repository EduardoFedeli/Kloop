import { v2 as cloudinary } from "cloudinary"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada`)
  return value
}

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  secure: true,
})

export { cloudinary }
