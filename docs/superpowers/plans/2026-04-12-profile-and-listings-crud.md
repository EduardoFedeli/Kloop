# Perfil de Usuário e CRUD de Anúncios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar edição de perfil do usuário logado e CRUD completo de anúncios no marketplace T-Hex Garage.

**Architecture:** Server Components buscam dados via Prisma e passam props para Client Components. Server Actions com validação Zod manipulam dados. Toasts via Sonner fornecem feedback. Slugs únicos gerados a partir do título. Preços sempre em centavos no banco; input aceita formato brasileiro (50,00).

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Prisma ORM, Zod v4, Sonner, slugify, Tailwind CSS (paleta T-Hex).

---

## File Map

| Ação | Arquivo |
|------|---------|
| Create | `src/types/next-auth.d.ts` |
| Create | `src/lib/validators/profile.ts` |
| Create | `src/lib/validators/address.ts` |
| Create | `src/lib/validators/listing.ts` |
| Create | `src/lib/slug.ts` |
| Create | `src/lib/actions/listing.ts` |
| Create | `src/lib/actions/profile.ts` |
| Create | `src/components/ui/ConfirmModal.tsx` |
| Create | `src/components/profile/ProfileForm.tsx` |
| Create | `src/components/profile/AddressSection.tsx` |
| Create | `src/components/listing/ListingForm.tsx` |
| Create | `src/components/listing/PhotoCarousel.tsx` |
| Create | `src/components/listing/ListingActions.tsx` |
| Create | `src/components/listing/MyListings.tsx` |
| Create | `src/app/(main)/listing/[slug]/edit/page.tsx` |
| Modify | `src/app/layout.tsx` |
| Modify | `next.config.ts` |
| Modify | `src/app/(main)/dashboard/page.tsx` |
| Modify | `src/app/(main)/profile/[id]/page.tsx` |
| Modify | `src/app/(main)/create/page.tsx` |
| Modify | `src/app/(main)/listing/[slug]/page.tsx` |

---

## Task 1: Instalar Sonner + Configurar tipos e imagens externas

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/types/next-auth.d.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Instalar sonner**

```bash
npm install sonner
```

Expected: `added 1 package` (ou similar)

- [ ] **Step 2: Adicionar Toaster ao root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "T-Hex Garage",
  description: "Marketplace consolidador de desapegos. Mobile-first, mercado brasileiro de seminovos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Criar augmentação de tipo para session.user.id**

```typescript
// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

- [ ] **Step 4: Permitir imagens externas no next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "**" }, // URLs externas de usuários
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Commitar**

```bash
git add src/app/layout.tsx src/types/next-auth.d.ts next.config.ts package.json package-lock.json
git commit -m "chore: instalar sonner e configurar tipos de sessão e imagens externas"
```

---

## Task 2: Validators Zod

**Files:**
- Create: `src/lib/validators/profile.ts`
- Create: `src/lib/validators/address.ts`
- Create: `src/lib/validators/listing.ts`

- [ ] **Step 1: Criar validator de perfil**

```typescript
// src/lib/validators/profile.ts
import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\(\)\-]{8,20}$/, "Telefone inválido")
    .optional(),
  avatarUrl: z.string().url("URL de avatar inválida").optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
```

- [ ] **Step 2: Criar validator de endereço**

```typescript
// src/lib/validators/address.ts
import { z } from "zod"

export const addressSchema = z.object({
  label: z.string().min(1, "Rótulo obrigatório").max(30),
  street: z.string().min(3, "Rua obrigatória").max(200),
  number: z.string().min(1, "Número obrigatório").max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório").max(100),
  city: z.string().min(2, "Cidade obrigatória").max(100),
  state: z.string().regex(/^[A-Za-z]{2}$/, "UF deve ter 2 letras"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 00000-000)"),
})

export type AddressFormValues = z.infer<typeof addressSchema>
```

- [ ] **Step 3: Criar validator de anúncio**

```typescript
// src/lib/validators/listing.ts
import { z } from "zod"

export const listingSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100, "Título muito longo"),
  description: z.string().min(10, "Descrição muito curta").max(2000, "Descrição muito longa"),
  priceCents: z.number().int("Preço inválido").positive("Preço deve ser positivo"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  brand: z.string().max(50, "Marca muito longa").optional(),
  size: z.string().max(20, "Tamanho muito longo").optional(),
  imageUrls: z
    .array(z.string().url("URL de imagem inválida"))
    .min(1, "Adicione pelo menos 1 foto")
    .max(6, "Máximo 6 fotos"),
})

export type ListingFormValues = z.infer<typeof listingSchema>
```

- [ ] **Step 4: Commitar**

```bash
git add src/lib/validators/
git commit -m "feat: adicionar validators Zod para perfil, endereço e anúncio"
```

---

## Task 3: Utilitário de Slug Único

**Files:**
- Create: `src/lib/slug.ts`

- [ ] **Step 1: Criar utilitário**

```typescript
// src/lib/slug.ts
import slugify from "slugify"
import { db } from "@/lib/db"

export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, locale: "pt" })

  const isAvailable = async (slug: string): Promise<boolean> => {
    const count = await db.listing.count({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
    return count === 0
  }

  if (await isAvailable(base)) return base

  let counter = 2
  while (!(await isAvailable(`${base}-${counter}`))) {
    counter++
  }
  return `${base}-${counter}`
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/lib/slug.ts
git commit -m "feat: adicionar utilitário de geração de slug único"
```

---

## Task 4: Server Actions — CRUD de Anúncios

**Files:**
- Create: `src/lib/actions/listing.ts`

- [ ] **Step 1: Criar o arquivo de actions**

```typescript
// src/lib/actions/listing.ts
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { listingSchema } from "@/lib/validators/listing"
import { generateUniqueSlug } from "@/lib/slug"
import { revalidatePath } from "next/cache"
import type { ListingCondition } from "@prisma/client"

export type ListingActionResult =
  | { success: true; slug?: string }
  | { success: false; error: string }

function parsePriceCents(value: string): number {
  // Aceita "50,00" (pt-BR) ou "50.00" (en-US)
  const normalized = value.replace(/\./g, "").replace(",", ".")
  const num = parseFloat(normalized)
  return Math.round(num * 100)
}

function extractImageUrls(formData: FormData): string[] {
  return (formData.getAll("imageUrls") as string[]).filter(Boolean)
}

export async function createListingAction(formData: FormData): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const userId = session.user.id

  // Verificar limite do plano
  const subscription = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: { select: { maxActiveListings: true, name: true } } },
  })

  const maxListings = subscription?.plan?.maxActiveListings ?? 5
  if (maxListings !== -1) {
    const activeCount = await db.listing.count({
      where: { sellerId: userId, status: "ACTIVE" },
    })
    if (activeCount >= maxListings) {
      const planName = subscription?.plan?.name ?? "Free"
      return {
        success: false,
        error: `Você atingiu o limite de ${maxListings} anúncios do plano ${planName}. Faça upgrade para continuar.`,
      }
    }
  }

  const priceRaw = formData.get("price") as string
  const priceCents = parsePriceCents(priceRaw)
  if (isNaN(priceCents) || priceCents <= 0) {
    return { success: false, error: "Preço inválido. Use o formato 50,00" }
  }

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents,
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    brand: formData.get("brand") || undefined,
    size: formData.get("size") || undefined,
    imageUrls: extractImageUrls(formData),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { title, description, priceCents: price, categoryId, condition, brand, size, imageUrls } =
    parsed.data

  const slug = await generateUniqueSlug(title)

  await db.listing.create({
    data: {
      sellerId: userId,
      categoryId,
      title,
      slug,
      description,
      priceCents: price,
      condition: condition as ListingCondition,
      brand: brand || null,
      size: size || null,
      status: "ACTIVE",
      images: {
        create: imageUrls.map((url, i) => ({ url, displayOrder: i, altText: title })),
      },
    },
  })

  revalidatePath("/")
  return { success: true, slug }
}

export async function updateListingAction(
  listingId: string,
  formData: FormData
): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const existing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true, slug: true, title: true },
  })

  if (!existing) return { success: false, error: "Anúncio não encontrado" }
  if (existing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }
  if (existing.status === "SOLD")
    return { success: false, error: "Não é possível editar um anúncio vendido" }

  const priceRaw = formData.get("price") as string
  const priceCents = parsePriceCents(priceRaw)
  if (isNaN(priceCents) || priceCents <= 0) {
    return { success: false, error: "Preço inválido. Use o formato 50,00" }
  }

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceCents,
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    brand: formData.get("brand") || undefined,
    size: formData.get("size") || undefined,
    imageUrls: extractImageUrls(formData),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { title, description, priceCents: price, categoryId, condition, brand, size, imageUrls } =
    parsed.data

  // Regenerar slug apenas se o título mudou
  const slug =
    title !== existing.title ? await generateUniqueSlug(title, listingId) : existing.slug

  await db.$transaction(async (tx) => {
    await tx.listingImage.deleteMany({ where: { listingId } })
    await tx.listing.update({
      where: { id: listingId },
      data: {
        categoryId,
        title,
        slug,
        description,
        priceCents: price,
        condition: condition as ListingCondition,
        brand: brand || null,
        size: size || null,
      },
    })
    if (imageUrls.length > 0) {
      await tx.listingImage.createMany({
        data: imageUrls.map((url, i) => ({ listingId, url, displayOrder: i, altText: title })),
      })
    }
  })

  revalidatePath(`/listing/${slug}`)
  revalidatePath("/dashboard")
  return { success: true, slug }
}

export async function deleteListingAction(listingId: string): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true },
  })

  if (!listing) return { success: false, error: "Anúncio não encontrado" }
  if (listing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }

  await db.listing.delete({ where: { id: listingId } })

  revalidatePath("/dashboard")
  revalidatePath("/")
  return { success: true }
}

export async function toggleListingStatusAction(listingId: string): Promise<ListingActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  })

  if (!listing) return { success: false, error: "Anúncio não encontrado" }
  if (listing.sellerId !== session.user.id) return { success: false, error: "Sem permissão" }
  if (listing.status === "SOLD")
    return { success: false, error: "Não é possível alterar status de um anúncio vendido" }

  const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
  await db.listing.update({ where: { id: listingId }, data: { status: newStatus } })

  revalidatePath("/dashboard")
  return { success: true }
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/lib/actions/listing.ts
git commit -m "feat: adicionar server actions de CRUD de anúncios"
```

---

## Task 5: Server Actions — Perfil e Endereços

**Files:**
- Create: `src/lib/actions/profile.ts`

- [ ] **Step 1: Criar o arquivo de actions**

```typescript
// src/lib/actions/profile.ts
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profileSchema } from "@/lib/validators/profile"
import { addressSchema } from "@/lib/validators/address"
import { revalidatePath } from "next/cache"

export type ProfileActionResult =
  | { success: true }
  | { success: false; error: string }

export async function updateProfileAction(formData: FormData): Promise<ProfileActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const rawPhone = formData.get("phone") as string
  const rawBio = formData.get("bio") as string
  const rawAvatarUrl = formData.get("avatarUrl") as string

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: rawBio || undefined,
    phone: rawPhone || undefined,
    avatarUrl: rawAvatarUrl || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { name, bio, phone, avatarUrl } = parsed.data

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: bio ?? null,
      phone: phone ?? null,
      avatarUrl: avatarUrl ?? null,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/profile/${session.user.id}`)
  return { success: true }
}

export async function createAddressAction(formData: FormData): Promise<ProfileActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const rawComplement = formData.get("complement") as string

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: rawComplement || undefined,
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { label, street, number, complement, neighborhood, city, state, zipCode } = parsed.data

  const existingCount = await db.address.count({ where: { userId: session.user.id } })

  await db.address.create({
    data: {
      userId: session.user.id,
      label,
      street,
      number,
      complement: complement ?? null,
      neighborhood,
      city,
      state: state.toUpperCase(),
      zipCode,
      isDefault: existingCount === 0,
    },
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteAddressAction(addressId: string): Promise<ProfileActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const address = await db.address.findUnique({
    where: { id: addressId },
    select: { userId: true, isDefault: true },
  })

  if (!address) return { success: false, error: "Endereço não encontrado" }
  if (address.userId !== session.user.id) return { success: false, error: "Sem permissão" }

  await db.address.delete({ where: { id: addressId } })

  // Se era o padrão, promover outro
  if (address.isDefault) {
    const first = await db.address.findFirst({ where: { userId: session.user.id } })
    if (first) {
      await db.address.update({ where: { id: first.id }, data: { isDefault: true } })
    }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function setDefaultAddressAction(addressId: string): Promise<ProfileActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autenticado" }

  const address = await db.address.findUnique({
    where: { id: addressId },
    select: { userId: true },
  })

  if (!address) return { success: false, error: "Endereço não encontrado" }
  if (address.userId !== session.user.id) return { success: false, error: "Sem permissão" }

  await db.$transaction([
    db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ])

  revalidatePath("/dashboard")
  return { success: true }
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/lib/actions/profile.ts
git commit -m "feat: adicionar server actions de perfil e endereços"
```

---

## Task 6: Componente ConfirmModal

**Files:**
- Create: `src/components/ui/ConfirmModal.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/ui/ConfirmModal.tsx
"use client"

import { useTransition } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-airforce">{title}</h3>
          <button
            onClick={onClose}
            className="text-teal-muted hover:text-airforce transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-teal-muted/40 text-sm font-medium text-airforce hover:bg-linen transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors",
              isPending ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isPending ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/components/ui/ConfirmModal.tsx
git commit -m "feat: adicionar componente ConfirmModal reutilizável"
```

---

## Task 7: Componentes de Perfil (ProfileForm + AddressSection)

**Files:**
- Create: `src/components/profile/ProfileForm.tsx`
- Create: `src/components/profile/AddressSection.tsx`

- [ ] **Step 1: Criar ProfileForm**

```tsx
// src/components/profile/ProfileForm.tsx
"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateProfileAction } from "@/lib/actions/profile"

type ProfileData = {
  name: string
  bio: string | null
  phone: string | null
  avatarUrl: string | null
}

type Props = {
  profile: ProfileData
}

export function ProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.success) {
        toast.success("Perfil atualizado com sucesso!")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Nome <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          type="text"
          defaultValue={profile.name}
          required
          maxLength={100}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-1">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={500}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm resize-none"
          placeholder="Fale um pouco sobre você..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-1">Telefone</label>
        <input
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-airforce mb-1">URL do Avatar</label>
        <input
          name="avatarUrl"
          type="url"
          defaultValue={profile.avatarUrl ?? ""}
          className="w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-bold text-white transition-colors",
          isPending ? "bg-gray-400 cursor-not-allowed" : "bg-airforce hover:bg-teal"
        )}
      >
        {isPending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Criar AddressSection**

```tsx
// src/components/profile/AddressSection.tsx
"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { MapPin, Plus, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/profile"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { Address } from "@prisma/client"

type Props = {
  addresses: Address[]
}

export function AddressSection({ addresses }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createAddressAction(formData)
      if (result.success) {
        toast.success("Endereço adicionado!")
        setShowForm(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddressAction(addressId)
      if (result.success) {
        toast.success("Endereço padrão atualizado!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteAddressAction(deleteTarget)
    if (result.success) {
      toast.success("Endereço removido!")
    } else {
      toast.error(result.error)
    }
    setDeleteTarget(null)
  }

  const inputCls =
    "mt-1 w-full px-3 py-2 rounded-lg border border-teal-muted/40 text-sm focus:outline-none focus:border-teal bg-white"

  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <p className="text-sm text-teal-muted">Nenhum endereço cadastrado.</p>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border",
            addr.isDefault
              ? "border-teal bg-celadon/10"
              : "border-teal-muted/30 bg-white"
          )}
        >
          <MapPin size={18} className="mt-0.5 text-teal shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-airforce">{addr.label}</span>
              {addr.isDefault && (
                <span className="text-[10px] bg-teal text-white px-2 py-0.5 rounded-full font-semibold">
                  padrão
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {addr.street}, {addr.number}
              {addr.complement ? `, ${addr.complement}` : ""}
            </p>
            <p className="text-xs text-gray-500">
              {addr.neighborhood} — {addr.city}/{addr.state} — CEP {addr.zipCode}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!addr.isDefault && (
              <button
                onClick={() => handleSetDefault(addr.id)}
                disabled={isPending}
                className="p-1.5 text-teal-muted hover:text-teal transition-colors disabled:opacity-50"
                title="Definir como padrão"
              >
                <Star size={16} />
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(addr.id)}
              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-teal hover:text-airforce transition-colors"
        >
          <Plus size={16} />
          Adicionar endereço
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 p-4 rounded-xl border border-teal-muted/30 bg-linen"
        >
          <h3 className="text-sm font-bold text-airforce">Novo endereço</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-airforce">Rótulo</label>
              <input name="label" defaultValue="Casa" required maxLength={30} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">CEP</label>
              <input name="zipCode" required placeholder="00000-000" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-airforce">Rua</label>
              <input name="street" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">Número</label>
              <input name="number" required className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-airforce">Complemento</label>
            <input name="complement" placeholder="Apto, Bloco..." className={inputCls} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-airforce">Bairro</label>
              <input name="neighborhood" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">Cidade</label>
              <input name="city" required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-airforce">UF</label>
              <input
                name="state"
                required
                maxLength={2}
                placeholder="SP"
                className={cn(inputCls, "uppercase")}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 text-sm text-airforce border border-teal-muted/40 rounded-lg hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 py-2 text-sm font-bold text-white rounded-lg transition-colors",
                isPending ? "bg-gray-400 cursor-not-allowed" : "bg-teal hover:bg-airforce"
              )}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Excluir endereço"
        description="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commitar**

```bash
git add src/components/profile/
git commit -m "feat: adicionar componentes de edição de perfil e endereços"
```

---

## Task 8: Dashboard Page + MyListings

**Files:**
- Modify: `src/app/(main)/dashboard/page.tsx`
- Create: `src/components/listing/MyListings.tsx`

- [ ] **Step 1: Criar componente MyListings**

```tsx
// src/components/listing/MyListings.tsx
"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Edit2, Pause, Play, Trash2 } from "lucide-react"
import { cn, formatPrice, formatDate } from "@/lib/utils"
import { deleteListingAction, toggleListingStatusAction } from "@/lib/actions/listing"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { ListingStatus } from "@prisma/client"

type ListingItem = {
  id: string
  title: string
  slug: string
  priceCents: number
  status: ListingStatus
  createdAt: Date
  category: { name: string }
  images: { url: string }[]
}

type Props = {
  listings: ListingItem[]
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Ativo", className: "bg-celadon text-airforce" },
  PAUSED: { label: "Pausado", className: "bg-yellow-100 text-yellow-700" },
  SOLD: { label: "Vendido", className: "bg-gray-100 text-gray-500" },
  DRAFT: { label: "Rascunho", className: "bg-blue-100 text-blue-700" },
  EXPIRED: { label: "Expirado", className: "bg-red-100 text-red-600" },
}

export function MyListings({ listings }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = (listingId: string) => {
    startTransition(async () => {
      const result = await toggleListingStatusAction(listingId)
      if (result.success) {
        toast.success("Status atualizado!")
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteListingAction(deleteTarget)
    if (result.success) {
      toast.success("Anúncio excluído!")
    } else {
      toast.error(result.error)
    }
    setDeleteTarget(null)
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-teal-muted/20">
        <p className="text-teal-muted text-sm">Você ainda não tem anúncios.</p>
        <Link
          href="/create"
          className="inline-block mt-4 px-6 py-2.5 bg-airforce text-white text-sm font-bold rounded-full hover:bg-teal transition-colors"
        >
          Criar meu primeiro anúncio
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {listings.map((listing) => {
          const { label, className } = statusConfig[listing.status]
          const thumbUrl = listing.images[0]?.url

          return (
            <div
              key={listing.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-teal-muted/20 p-3 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-linen">
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-muted text-[10px]">
                    sem foto
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/listing/${listing.slug}`}
                  className="block text-sm font-semibold text-airforce hover:text-teal line-clamp-1 transition-colors"
                >
                  {listing.title}
                </Link>
                <p className="text-sm font-bold text-airforce">{formatPrice(listing.priceCents)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", className)}>
                    {label}
                  </span>
                  <span className="text-[10px] text-teal-muted">{formatDate(listing.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {listing.status !== "SOLD" && (
                  <Link
                    href={`/listing/${listing.slug}/edit`}
                    className="p-2 text-teal-muted hover:text-airforce transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </Link>
                )}
                {(listing.status === "ACTIVE" || listing.status === "PAUSED") && (
                  <button
                    onClick={() => handleToggleStatus(listing.id)}
                    disabled={isPending}
                    className="p-2 text-teal-muted hover:text-airforce disabled:opacity-50 transition-colors"
                    title={listing.status === "ACTIVE" ? "Pausar" : "Ativar"}
                  >
                    {listing.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(listing.id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Excluir anúncio"
        description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
```

- [ ] **Step 2: Implementar Dashboard page**

```tsx
// src/app/(main)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { AddressSection } from "@/components/profile/AddressSection"
import { MyListings } from "@/components/listing/MyListings"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const [user, listings] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        addresses: { orderBy: { createdAt: "asc" } },
        subscription: {
          include: { plan: { select: { name: true, maxActiveListings: true } } },
        },
        _count: { select: { listings: { where: { status: "ACTIVE" } } } },
      },
    }),
    db.listing.findMany({
      where: { sellerId: session.user.id },
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!user) redirect("/")

  const maxListings = user.subscription?.plan?.maxActiveListings ?? 5
  const activeCount = user._count.listings

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-airforce">Minha conta</h1>
          <p className="text-sm text-teal-muted mt-1">Membro desde {formatDate(user.createdAt)}</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-airforce text-white text-sm font-bold rounded-full hover:bg-teal transition-colors"
        >
          <PlusCircle size={16} />
          Novo anúncio
        </Link>
      </div>

      {/* Editar perfil */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <h2 className="text-lg font-bold text-airforce mb-4">Editar perfil</h2>
        <ProfileForm
          profile={{
            name: user.name,
            bio: user.bio,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
          }}
        />
      </section>

      {/* Endereços */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <h2 className="text-lg font-bold text-airforce mb-4">Endereços</h2>
        <AddressSection addresses={user.addresses} />
      </section>

      {/* Meus anúncios */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-airforce">Meus anúncios</h2>
          <span className="text-sm text-teal-muted">
            {activeCount} de {maxListings === -1 ? "∞" : maxListings} ativos
          </span>
        </div>
        <MyListings listings={listings} />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Commitar**

```bash
git add src/app/(main)/dashboard/page.tsx src/components/listing/MyListings.tsx
git commit -m "feat: implementar dashboard com perfil, endereços e lista de anúncios"
```

---

## Task 9: Página de Perfil Público

**Files:**
- Modify: `src/app/(main)/profile/[id]/page.tsx`

- [ ] **Step 1: Implementar a página**

```tsx
// src/app/(main)/profile/[id]/page.tsx
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit3, Star, Package, CalendarDays } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { ListingGrid } from "@/components/listing/ListingGrid"
import type { ListingWithDetails } from "@/types/listing"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const session = await auth()
  const isOwn = session?.user?.id === id

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      reviewsReceived: { select: { rating: true } },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { displayOrder: "asc" },
            take: 1,
            select: { url: true, altText: true },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              addresses: {
                where: { isDefault: true },
                select: { city: true, state: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!user) notFound()

  const totalRatings = user.reviewsReceived.length
  const avgRating =
    totalRatings > 0
      ? (user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
      : null

  const listings: ListingWithDetails[] = user.listings
  const initials = user.name.substring(0, 2).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      {/* Card do perfil */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-muted/20">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-celadon/30">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-airforce">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-black text-airforce">{user.name}</h1>
              {isOwn && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-teal hover:text-airforce transition-colors shrink-0"
                >
                  <Edit3 size={14} />
                  Editar perfil
                </Link>
              )}
            </div>
            {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-teal-muted">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                Desde {formatDate(user.createdAt)}
              </span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400" />
                  {avgRating} ({totalRatings} avaliação{totalRatings !== 1 ? "ões" : ""})
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package size={12} />
                {listings.length} anúncio{listings.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anúncios ativos */}
      <div>
        <h2 className="text-lg font-bold text-airforce mb-4">Anúncios ativos</h2>
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <p className="text-sm text-teal-muted text-center py-8 bg-white rounded-2xl border border-teal-muted/20">
            Nenhum anúncio ativo no momento.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/app/(main)/profile/
git commit -m "feat: implementar página de perfil público"
```

---

## Task 10: Componente ListingForm (compartilhado criar/editar)

**Files:**
- Create: `src/components/listing/ListingForm.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/listing/ListingForm.tsx
"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CategoryOption } from "@/types/listing"
import type { ListingActionResult } from "@/lib/actions/listing"
import type { ListingCondition } from "@prisma/client"

const conditionOptions: { value: ListingCondition; label: string }[] = [
  { value: "NEW", label: "Novo" },
  { value: "LIKE_NEW", label: "Seminovo" },
  { value: "GOOD", label: "Bom estado" },
  { value: "FAIR", label: "Usado" },
]

type InitialData = {
  title: string
  description: string
  priceCents: number
  categoryId: string
  condition: ListingCondition
  brand: string | null
  size: string | null
  imageUrls: string[]
}

type Props = {
  categories: CategoryOption[]
  action: (formData: FormData) => Promise<ListingActionResult>
  initialData?: InitialData
  submitLabel?: string
}

const fieldCls =
  "w-full px-4 py-2.5 rounded-xl border border-teal-muted/40 bg-white text-gray-800 focus:outline-none focus:border-teal text-sm"

export function ListingForm({
  categories,
  action,
  initialData,
  submitLabel = "Publicar anúncio",
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.imageUrls.length ? initialData.imageUrls : [""]
  )

  // Exibe preço em reais para o campo (ex: "50,00")
  const displayPrice = initialData
    ? (initialData.priceCents / 100).toFixed(2).replace(".", ",")
    : ""

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // imageUrls são controlados via state — substituir entradas do form
    formData.delete("imageUrls")
    imageUrls.filter(Boolean).forEach((url) => formData.append("imageUrls", url))

    startTransition(async () => {
      const result = await action(formData)
      if (result.success) {
        toast.success(initialData ? "Anúncio atualizado!" : "Anúncio publicado!")
        if (result.slug) router.push(`/listing/${result.slug}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const addImageUrl = () => {
    if (imageUrls.length < 6) setImageUrls((prev) => [...prev, ""])
  }

  const removeImageUrl = (index: number) => {
    if (imageUrls.length === 1) return
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    setImageUrls((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    if (index === imageUrls.length - 1) return
    setImageUrls((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          type="text"
          defaultValue={initialData?.title ?? ""}
          required
          maxLength={100}
          className={fieldCls}
          placeholder="Ex: Calça jeans azul slim fit"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Descrição <span className="text-red-400">*</span>
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description ?? ""}
          required
          rows={4}
          maxLength={2000}
          className={cn(fieldCls, "resize-none")}
          placeholder="Descreva o produto: estado, medidas, marca, detalhes relevantes..."
        />
      </div>

      {/* Preço + Categoria */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">
            Preço (R$) <span className="text-red-400">*</span>
          </label>
          <input
            name="price"
            type="text"
            defaultValue={displayPrice}
            required
            className={fieldCls}
            placeholder="50,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">
            Categoria <span className="text-red-400">*</span>
          </label>
          <select
            name="categoryId"
            defaultValue={initialData?.categoryId ?? ""}
            required
            className={fieldCls}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Condição */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-1">
          Condição <span className="text-red-400">*</span>
        </label>
        <select
          name="condition"
          defaultValue={initialData?.condition ?? ""}
          required
          className={fieldCls}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {conditionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Marca + Tamanho */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">Marca</label>
          <input
            name="brand"
            type="text"
            defaultValue={initialData?.brand ?? ""}
            maxLength={50}
            className={fieldCls}
            placeholder="Nike, Samsung..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-airforce mb-1">Tamanho</label>
          <input
            name="size"
            type="text"
            defaultValue={initialData?.size ?? ""}
            maxLength={20}
            className={fieldCls}
            placeholder="M, G, 42..."
          />
        </div>
      </div>

      {/* Fotos */}
      <div>
        <label className="block text-sm font-medium text-airforce mb-2">
          Fotos (URLs) <span className="text-red-400">*</span>{" "}
          <span className="text-teal-muted font-normal">— {imageUrls.length}/6</span>
        </label>
        <div className="space-y-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className={cn(fieldCls, "flex-1")}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-2 text-teal-muted hover:text-airforce disabled:opacity-30 transition-colors"
                aria-label="Mover para cima"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === imageUrls.length - 1}
                className="p-2 text-teal-muted hover:text-airforce disabled:opacity-30 transition-colors"
                aria-label="Mover para baixo"
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => removeImageUrl(i)}
                disabled={imageUrls.length === 1}
                className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                aria-label="Remover foto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {imageUrls.length < 6 && (
          <button
            type="button"
            onClick={addImageUrl}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-teal hover:text-airforce transition-colors"
          >
            <PlusCircle size={16} />
            Adicionar foto
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 rounded-xl text-base font-bold text-white transition-colors",
          isPending ? "bg-gray-400 cursor-not-allowed" : "bg-airforce hover:bg-teal"
        )}
      >
        {isPending ? "Publicando..." : submitLabel}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/components/listing/ListingForm.tsx
git commit -m "feat: adicionar componente de formulário de anúncio (criar/editar)"
```

---

## Task 11: Página Criar Anúncio

**Files:**
- Modify: `src/app/(main)/create/page.tsx`

- [ ] **Step 1: Implementar a página**

```tsx
// src/app/(main)/create/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ListingForm } from "@/components/listing/ListingForm"
import { createListingAction } from "@/lib/actions/listing"
import type { CategoryOption } from "@/types/listing"

export default async function CreateListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const userId = session.user.id

  const [subscription, categories, activeCount] = await Promise.all([
    db.userSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { name: true, maxActiveListings: true } } },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
  ])

  const maxListings = subscription?.plan?.maxActiveListings ?? 5
  const planName = subscription?.plan?.name ?? "Free"
  const hasReachedLimit = maxListings !== -1 && activeCount >= maxListings

  const categoryOptions: CategoryOption[] = categories

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-airforce mb-2">Criar anúncio</h1>
      <p className="text-sm text-teal-muted mb-6">
        {maxListings === -1
          ? "Anúncios ilimitados no seu plano"
          : `${activeCount} de ${maxListings} anúncios ativos`}
      </p>

      {hasReachedLimit ? (
        <div className="bg-white rounded-2xl p-8 border border-teal-muted/20 text-center space-y-4">
          <p className="text-base font-semibold text-airforce">
            Você atingiu o limite de {maxListings} anúncios do plano {planName}.
          </p>
          <p className="text-sm text-teal-muted">
            Faça upgrade para publicar mais anúncios sem limites.
          </p>
          <Link
            href="/plans"
            className="inline-block px-6 py-3 bg-airforce text-white font-bold rounded-full hover:bg-teal transition-colors"
          >
            Ver planos
          </Link>
        </div>
      ) : (
        <ListingForm categories={categoryOptions} action={createListingAction} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/app/(main)/create/page.tsx
git commit -m "feat: implementar página de criação de anúncio com verificação de limite de plano"
```

---

## Task 12: Página de Detalhe do Anúncio

**Files:**
- Modify: `src/app/(main)/listing/[slug]/page.tsx`
- Create: `src/components/listing/PhotoCarousel.tsx`
- Create: `src/components/listing/ListingActions.tsx`

- [ ] **Step 1: Criar PhotoCarousel**

```tsx
// src/components/listing/PhotoCarousel.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ImageData = {
  id: string
  url: string
  altText: string | null
}

type Props = {
  images: ImageData[]
  title: string
}

export function PhotoCarousel({ images, title }: Props) {
  const [current, setCurrent] = useState(0)

  const fallback = "https://picsum.photos/seed/thex-fallback/600/600"
  const displayImages =
    images.length > 0 ? images : [{ id: "fallback", url: fallback, altText: title }]

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-linen">
        <Image
          src={displayImages[current]?.url ?? fallback}
          alt={displayImages[current]?.altText ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Foto ${i + 1}`}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                i === current
                  ? "border-airforce"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.altText ?? title} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Criar ListingActions**

```tsx
// src/components/listing/ListingActions.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Edit2, Trash2, MessageCircle, ShoppingBag } from "lucide-react"
import { deleteListingAction } from "@/lib/actions/listing"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import type { ListingStatus } from "@prisma/client"

type Props = {
  listing: { id: string; slug: string; status: ListingStatus }
  isOwner: boolean
}

export function ListingActions({ listing, isOwner }: Props) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = async () => {
    const result = await deleteListingAction(listing.id)
    if (result.success) {
      toast.success("Anúncio excluído!")
      router.push("/dashboard")
    } else {
      toast.error(result.error)
    }
  }

  if (isOwner) {
    return (
      <>
        <div className="flex gap-3">
          {listing.status !== "SOLD" && (
            <Link
              href={`/listing/${listing.slug}/edit`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-airforce text-airforce font-bold text-sm hover:bg-airforce hover:text-white transition-colors"
            >
              <Edit2 size={16} />
              Editar
            </Link>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-red-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Excluir anúncio"
          description="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      </>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        disabled
        title="Chat em breve"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
      >
        <MessageCircle size={16} />
        Conversar
      </button>
      <button
        disabled
        title="Compra em breve"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-airforce/20 text-airforce/50 font-bold text-sm cursor-not-allowed"
      >
        <ShoppingBag size={16} />
        Comprar agora
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Implementar a página de detalhe**

```tsx
// src/app/(main)/listing/[slug]/page.tsx
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, CalendarDays, Eye } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice, formatDate, cn } from "@/lib/utils"
import { PhotoCarousel } from "@/components/listing/PhotoCarousel"
import { ListingActions } from "@/components/listing/ListingActions"
import type { ListingCondition } from "@prisma/client"

const conditionLabel: Record<ListingCondition, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom estado",
  FAIR: "Usado",
}

const conditionColor: Record<ListingCondition, string> = {
  NEW: "bg-celadon text-airforce",
  LIKE_NEW: "bg-teal text-linen",
  GOOD: "bg-teal-muted text-linen",
  FAIR: "bg-teal-muted/60 text-airforce",
}

interface ListingPageProps {
  params: Promise<{ slug: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params
  const session = await auth()

  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { listings: { where: { status: "ACTIVE" } } } },
          reviewsReceived: { select: { rating: true } },
        },
      },
      category: { select: { name: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  })

  if (!listing || listing.status === "DRAFT") notFound()

  // Incrementar viewsCount (fire-and-forget)
  void db.listing
    .update({ where: { id: listing.id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {
      /* ignora erros silenciosamente */
    })

  const isOwner = session?.user?.id === listing.sellerId

  const totalRatings = listing.seller.reviewsReceived.length
  const avgRating =
    totalRatings > 0
      ? (
          listing.seller.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        ).toFixed(1)
      : null

  const sellerInitials = listing.seller.name.substring(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Fotos */}
        <PhotoCarousel images={listing.images} title={listing.title} />

        {/* Informações */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-black text-airforce leading-tight flex-1">
                {listing.title}
              </h1>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
                  conditionColor[listing.condition]
                )}
              >
                {conditionLabel[listing.condition]}
              </span>
            </div>
            <p className="text-3xl font-black text-airforce mt-2">
              {formatPrice(listing.priceCents)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-xs text-teal-muted">
            <span className="bg-celadon/30 px-3 py-1 rounded-full">{listing.category.name}</span>
            {listing.brand && (
              <span className="bg-celadon/30 px-3 py-1 rounded-full">{listing.brand}</span>
            )}
            {listing.size && (
              <span className="bg-celadon/30 px-3 py-1 rounded-full">Tam. {listing.size}</span>
            )}
            <span className="flex items-center gap-1 text-teal-muted/60">
              <Eye size={11} />
              {listing.viewsCount} visualizações
            </span>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold text-airforce mb-1">Descrição</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Card do vendedor */}
          <div className="bg-linen rounded-xl p-4 border border-teal-muted/20">
            <h3 className="text-xs font-semibold text-teal-muted uppercase tracking-wide mb-3">
              Vendedor
            </h3>
            <div className="flex items-center gap-3">
              <Link href={`/profile/${listing.seller.id}`}>
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-celadon/30 shrink-0">
                  {listing.seller.avatarUrl ? (
                    <Image
                      src={listing.seller.avatarUrl}
                      alt={listing.seller.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-airforce">
                      {sellerInitials}
                    </div>
                  )}
                </div>
              </Link>
              <div>
                <Link
                  href={`/profile/${listing.seller.id}`}
                  className="font-semibold text-sm text-airforce hover:text-teal transition-colors"
                >
                  {listing.seller.name}
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-muted">
                  {avgRating && (
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="text-yellow-400" />
                      {avgRating} ({totalRatings})
                    </span>
                  )}
                  <span>
                    {listing.seller._count.listings} anúncio
                    {listing.seller._count.listings !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <CalendarDays size={10} />
                    Desde {formatDate(listing.seller.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <ListingActions
            listing={{ id: listing.id, slug: listing.slug, status: listing.status }}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commitar**

```bash
git add src/app/(main)/listing/[slug]/page.tsx src/components/listing/PhotoCarousel.tsx src/components/listing/ListingActions.tsx
git commit -m "feat: implementar página de detalhe do anúncio com carrossel e card do vendedor"
```

---

## Task 13: Página de Editar Anúncio

**Files:**
- Create: `src/app/(main)/listing/[slug]/edit/page.tsx`

- [ ] **Step 1: Criar a página**

```tsx
// src/app/(main)/listing/[slug]/edit/page.tsx
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ListingForm } from "@/components/listing/ListingForm"
import { updateListingAction } from "@/lib/actions/listing"
import type { CategoryOption } from "@/types/listing"
import type { ListingCondition } from "@prisma/client"

interface EditListingPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const [listing, categories] = await Promise.all([
    db.listing.findUnique({
      where: { slug },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!listing) notFound()
  if (listing.sellerId !== session.user.id) redirect("/dashboard")
  if (listing.status === "SOLD") redirect(`/listing/${slug}`)

  const categoryOptions: CategoryOption[] = categories

  // Bind do listingId como primeiro argumento da action
  const boundAction = updateListingAction.bind(null, listing.id)

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-airforce mb-6">Editar anúncio</h1>
      <ListingForm
        categories={categoryOptions}
        action={boundAction}
        initialData={{
          title: listing.title,
          description: listing.description,
          priceCents: listing.priceCents,
          categoryId: listing.categoryId,
          condition: listing.condition as ListingCondition,
          brand: listing.brand,
          size: listing.size,
          imageUrls: listing.images.map((img) => img.url),
        }}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/app/(main)/listing/
git commit -m "feat: implementar página de edição de anúncio"
```

---

## Task 14: Build final e branch de feature

- [ ] **Step 1: Rodar build de produção**

```bash
npm run build
```

Expected: build succeeds com zero erros TypeScript. Se houver erros, corrigir antes de continuar.

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

Expected: sem erros.

- [ ] **Step 3: Commit de ajustes (se necessário)**

Se houver correções durante o build:

```bash
git add -A
git commit -m "fix: corrigir erros de tipo após build"
```

- [ ] **Step 4: Criar branch e PR**

A branch atual deve ser `feature/profile-and-listings-crud` ou similar. Verifique com `git branch` e crie se necessário:

```bash
git checkout -b feature/profile-and-listings-crud
# (se já foi commitado acima, os commits já estão na branch)
```

Avisar o usuário para abrir o PR para `develop`.

---

## Notas de Implementação

### Preços
- Input do formulário: `"50,00"` (formato pt-BR) → banco: `5000` centavos
- Exibição: sempre via `formatPrice(priceCents)` de `@/lib/utils`

### Limite do plano
- `maxActiveListings = -1` significa ilimitado
- Sem `UserSubscription`: considera limite de 5 (Free)
- Verificação tanto no Server Component (para mostrar tela de bloqueio) quanto na Server Action (para segurança)

### Slugs únicos
- Gerados por `slugify` com locale `pt`
- Sufixo numérico incremental se já existe: `calca-jeans`, `calca-jeans-2`, `calca-jeans-3`...
- Na edição: slug é regenerado apenas se o título mudou

### viewsCount
- Incrementado na page de detalhe via `void db.listing.update(...)` (fire-and-forget)
- Erros são silenciados para não quebrar a renderização da página
