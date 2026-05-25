import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          subscription: { select: { plan: { select: { name: true, slug: true, commissionRate: true } } } },
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          priceCents: true,
          condition: true,
          images: { select: { url: true }, take: 1 },
        },
      },
      address: true,
      cashbackTransactions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          amountCents: true,
          description: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!transaction) {
    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
  }

  return NextResponse.json({
    ...transaction,
    commissionRate: Number(transaction.commissionRate),
    seller: {
      ...transaction.seller,
      subscription: transaction.seller.subscription
        ? {
            ...transaction.seller.subscription,
            plan: {
              ...transaction.seller.subscription.plan,
              commissionRate: Number(transaction.seller.subscription.plan.commissionRate),
            },
          }
        : null,
    },
  })
}
