export interface ShippingResult {
  priceCents: number
  estimatedDays: number
  label: string
}

const FALLBACK: ShippingResult = { priceCents: 2990, estimatedDays: 8, label: "frete padrão" }

// Broad macro-regions — first digit of CEP maps to a zone
// 0,1,2,3 = Sudeste; 4,5 = Nordeste; 6 = Norte; 7 = Centro-Oeste; 8,9 = Sul
const MACRO_REGION: Record<string, number> = {
  "0": 1, "1": 1, "2": 1, "3": 1,
  "4": 2, "5": 2,
  "6": 3,
  "7": 4,
  "8": 5, "9": 5,
}

function normalize(cep: string): string {
  return cep.replace(/\D/g, "")
}

export function calculateShipping(originCep: string, destCep: string): ShippingResult {
  const origin = normalize(originCep)
  const dest = normalize(destCep)

  if (origin.length !== 8 || dest.length !== 8) return FALLBACK

  // Same city: first 4 digits equal
  if (origin.slice(0, 4) === dest.slice(0, 4)) {
    return { priceCents: 990, estimatedDays: 2, label: "frete local" }
  }

  // Same state: first digit equal (each digit covers one state or group)
  if (origin[0] === dest[0]) {
    return { priceCents: 1490, estimatedDays: 3, label: "frete estadual" }
  }

  // Neighboring states: same macro-region (Sudeste, Nordeste, Sul…)
  const originZone = MACRO_REGION[origin[0]]
  const destZone = MACRO_REGION[dest[0]]

  if (originZone !== undefined && originZone === destZone) {
    return { priceCents: 1990, estimatedDays: 5, label: "frete regional" }
  }

  return { priceCents: 2990, estimatedDays: 8, label: "frete nacional" }
}
