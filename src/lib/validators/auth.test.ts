import { describe, it, expect } from "vitest"
import { registerSchema, loginSchema } from "./auth"

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@email.com",
      password: "kloop123",
      confirmPassword: "kloop123",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "abc12",
      confirmPassword: "abc12",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.flatten().fieldErrors
    expect(errors?.password).toBeDefined()
  })

  it("rejeita senha sem letra", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "12345678",
      confirmPassword: "12345678",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it("rejeita senha sem número", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it("rejeita quando senhas não conferem", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "kloop123",
      confirmPassword: "kloop456",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined()
  })

  it("rejeita email inválido", () => {
    const result = registerSchema.safeParse({
      name: "João",
      email: "nao-e-email",
      password: "kloop123",
      confirmPassword: "kloop123",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })
})

describe("loginSchema", () => {
  it("aceita dados válidos", () => {
    const result = loginSchema.safeParse({
      email: "joao@email.com",
      password: "qualquercoisa",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha vazia com mensagem 'informe sua senha'", () => {
    const result = loginSchema.safeParse({
      email: "joao@email.com",
      password: "",
    })
    expect(result.success).toBe(false)
    const errors = result.error?.flatten().fieldErrors
    expect(errors?.password?.[0]).toBe("informe sua senha")
  })
})
