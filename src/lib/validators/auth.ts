import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2, "nome é obrigatório"),
    email: z.string().email("email inválido"),
    password: z
      .string()
      .min(8, "a senha deve ter no mínimo 8 caracteres")
      .regex(/[a-zA-Z]/, "a senha deve ter pelo menos 1 letra")
      .regex(/\d/, "a senha deve ter pelo menos 1 número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "as senhas não conferem",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("email inválido"),
  password: z.string().min(1, "informe sua senha"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
