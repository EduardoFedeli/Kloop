import { describe, it, expect } from "vitest"
import { calculateShipping } from "./shipping"

describe("calculateShipping", () => {
  it("mesma cidade (4 primeiros dígitos iguais) → R$ 9,90 / 2 dias", () => {
    const result = calculateShipping("01310100", "01310500")
    expect(result.priceCents).toBe(990)
    expect(result.estimatedDays).toBe(2)
  })

  it("mesmo estado SP (2 primeiros dígitos iguais) → R$ 14,90 / 3 dias", () => {
    const result = calculateShipping("01310100", "04567000")
    expect(result.priceCents).toBe(1490)
    expect(result.estimatedDays).toBe(3)
  })

  it("SP → RJ (mesma região Correios) → R$ 19,90 / 5 dias", () => {
    const result = calculateShipping("01310100", "22000000")
    expect(result.priceCents).toBe(1990)
    expect(result.estimatedDays).toBe(5)
  })

  it("SP → PR (regiões diferentes) → R$ 29,90 / 8 dias", () => {
    const result = calculateShipping("01310100", "80000000")
    expect(result.priceCents).toBe(2990)
    expect(result.estimatedDays).toBe(8)
  })

  it("aceita CEP com hífen", () => {
    const result = calculateShipping("01310-100", "01310-500")
    expect(result.priceCents).toBe(990)
  })

  it("CEP inválido retorna fallback padrão", () => {
    const result = calculateShipping("0000", "12345678")
    expect(result.priceCents).toBe(2990)
    expect(result.estimatedDays).toBe(8)
    expect(result.label).toBe("frete padrão")
  })
})
