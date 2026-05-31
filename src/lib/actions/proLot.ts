"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateLotCode(): string {
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = String(date.getFullYear()).slice(-2)
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7)
  return `PRO-${dd}${mm}${yy}${rand}`
}

const FAKE_ITEMS = [
  { name: "Camiseta básica branca", descriptions: ["Algodão 100%, tamanho M", "Levemente usada, ótimo estado"] },
  { name: "Calça jeans skinny", descriptions: ["Jeans azul, tamanho 38", "Desgaste natural, boa condição"] },
  { name: "Vestido floral midi", descriptions: ["Viscose, estampa flores, P", "Usado poucas vezes"] },
  { name: "Blusa de tricô", descriptions: ["Lã grossa, bege, M", "Perfeita para o inverno"] },
  { name: "Jaqueta jeans", descriptions: ["Denim lavado, G", "Clássica, sem defeitos"] },
  { name: "Saia plissada midi", descriptions: ["Poliéster, preta, 36", "Nova sem etiqueta"] },
  { name: "Tênis branco casual", descriptions: ["Nº 37, couro sintético", "Usado poucas vezes, sem manchas"] },
  { name: "Sandália rasteira", descriptions: ["Couro, nº 36, nude", "Levíssima, confortável"] },
  { name: "Blazer oversized", descriptions: ["Alfaiataria, xadrez, M", "Perfeito para escritório"] },
  { name: "Shorts jeans bordado", descriptions: ["Bordado floral, 38", "Verão perfeito"] },
  { name: "Moletom cropped", descriptions: ["Fleece, rosa, P", "Nunca usado"] },
  { name: "Calça de couro", descriptions: ["Fake leather, preta, 40", "Usada uma vez"] },
  { name: "Camisa social listrada", descriptions: ["Algodão, listras finas, M", "Sem defeitos"] },
  { name: "Vestido tubinho preto", descriptions: ["Crepe, P/M, clássico", "Ótimo estado"] },
  { name: "Regata de seda", descriptions: ["100% seda, nude, P", "Cuidado especial, impecável"] },
  { name: "Cardigã longo", descriptions: ["Tricô fino, caramelo, M", "Usado poucas vezes"] },
  { name: "Macacão floral", descriptions: ["Viscose, tamanho único", "Leve e confortável"] },
  { name: "Bota de cano curto", descriptions: ["Couro legítimo, nº 37", "Pouco uso, bom estado"] },
  { name: "Bolsa tote", descriptions: ["Lona, 35x40cm, preta", "Espaçosa e resistente"] },
  { name: "Casaco de lã", descriptions: ["Lã pura, cinza, G", "Excelente para inverno"] },
  { name: "Cropped listrado", descriptions: ["Malha canelada, P", "Nunca usado"] },
  { name: "Calça de alfaiataria", descriptions: ["Bege, 38, forro", "Usada duas vezes"] },
  { name: "Sapatilha bailarina", descriptions: ["Verniz, nº 36, preta", "Sem arranhados"] },
  { name: "Kimono estampado", descriptions: ["Crepe leve, tamanho único", "Perfeito para praia"] },
  { name: "Polo masculina", descriptions: ["Piquet, azul marinho, M", "Sem defeitos"] },
]

import { ListingCondition } from "@prisma/client"

const CONDITIONS: ListingCondition[] = ["NEW", "LIKE_NEW", "GOOD", "FAIR"]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomItems(count: number) {
  const shuffled = [...FAKE_ITEMS].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, FAKE_ITEMS.length))

  return selected.map((item) => ({
    name: item.name,
    description: pickRandom(item.descriptions),
    condition: pickRandom(CONDITIONS),
  }))
}

export async function createProLot(
  shippingMethod: "CORREIOS" | "COLETA",
  withBag: boolean
): Promise<{ code: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const pendingLot = await db.proLot.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "RECEIVED", "ANALYZING"] },
    },
  })

  if (pendingLot) {
    return { error: "Você já tem um lote em andamento. Aguarde a análise para enviar um novo." }
  }

  let code = generateLotCode()
  while (await db.proLot.findUnique({ where: { code } })) {
    code = generateLotCode()
  }

  const itemCount = Math.floor(Math.random() * 18) + 3
  const items = generateRandomItems(itemCount)

  await db.proLot.create({
    data: {
      userId: session.user.id,
      code,
      shippingMethod,
      withBag,
      status: "ANALYZING",
      items: {
        create: items,
      },
    },
  })

  return { code }
}
