import { CashbackTransactionType, PrismaClient } from '@prisma/client'
import { db } from '@/lib/db'

export type TxClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

// ── Constants ────────────────────────────────────────────────────────────────

const CASHBACK_EXPIRY_DAYS = 120
const SELLER_RATE = 0.05
const BUYER_RATE = 0.02
const MAX_USAGE_RATE = 0.30

// ── Pure helpers ─────────────────────────────────────────────────────────────

export function calcSellerCashback(amountCents: number): number {
  return Math.floor(amountCents * SELLER_RATE)
}

export function calcBuyerCashback(amountCents: number): number {
  return Math.floor(amountCents * BUYER_RATE)
}

export function calcMaxUsage(amountCents: number): number {
  return Math.floor(amountCents * MAX_USAGE_RATE)
}

// ── Standalone helpers (outside $transaction) ─────────────────────────────────

export async function getCashbackBalance(userId: string): Promise<number> {
  const now = new Date()
  const rows = await db.cashbackTransaction.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { type: true, amountCents: true },
  })

  return rows.reduce((sum, row) => {
    const isCredit =
      row.type === CashbackTransactionType.CREDIT_SELLER ||
      row.type === CashbackTransactionType.CREDIT_BUYER ||
      row.type === CashbackTransactionType.REFUND_CANCELLATION
    return sum + (isCredit ? row.amountCents : -row.amountCents)
  }, 0)
}

export async function getExpiringCashback(
  userId: string,
  withinDays: number,
): Promise<number> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  const rows = await db.cashbackTransaction.findMany({
    where: {
      userId,
      expiresAt: { gt: now, lte: cutoff },
      type: {
        in: [
          CashbackTransactionType.CREDIT_SELLER,
          CashbackTransactionType.CREDIT_BUYER,
        ],
      },
    },
    select: { amountCents: true },
  })

  return rows.reduce((sum, row) => sum + row.amountCents, 0)
}

export async function getMaxApplicable(
  userId: string,
  transactionAmountCents: number,
): Promise<number> {
  const balance = await getCashbackBalance(userId)
  return Math.min(balance, calcMaxUsage(transactionAmountCents))
}

// ── Transaction-aware helpers (must run inside db.$transaction) ───────────────

interface CreditParams {
  userId: string
  type: 'CREDIT_SELLER' | 'CREDIT_BUYER'
  amountCents: number
  description: string
  transactionId?: string
}

export async function creditCashback(
  tx: TxClient,
  params: CreditParams,
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CASHBACK_EXPIRY_DAYS)

  await tx.cashbackTransaction.create({
    data: {
      userId: params.userId,
      type: params.type,
      amountCents: params.amountCents,
      expiresAt,
      transactionId: params.transactionId ?? null,
      description: params.description,
    },
  })
}

interface DebitParams {
  userId: string
  amountCents: number
  transactionId: string
  description: string
}

export async function debitCashback(
  tx: TxClient,
  params: DebitParams,
): Promise<void> {
  await assertSufficientBalance(tx, params.userId, params.amountCents)

  await tx.cashbackTransaction.create({
    data: {
      userId: params.userId,
      type: CashbackTransactionType.DEBIT_PURCHASE,
      amountCents: params.amountCents,
      transactionId: params.transactionId,
      description: params.description,
    },
  })
}

interface RefundParams {
  buyerId: string
  amountCents: number
  transactionId: string
  debitRecordId: string
}

export async function refundCashback(
  tx: TxClient,
  params: RefundParams,
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CASHBACK_EXPIRY_DAYS)

  await tx.cashbackTransaction.create({
    data: {
      userId: params.buyerId,
      type: CashbackTransactionType.REFUND_CANCELLATION,
      amountCents: params.amountCents,
      expiresAt,
      transactionId: params.transactionId,
      parentId: params.debitRecordId,
      description: 'Estorno de cashback por cancelamento',
    },
  })
}

export async function reverseCashback(
  tx: TxClient,
  transactionId: string,
): Promise<void> {
  const existing = await tx.cashbackTransaction.findFirst({
    where: {
      transactionId,
      type: CashbackTransactionType.REVERSAL,
    },
  })

  if (existing) return

  const credits = await tx.cashbackTransaction.findMany({
    where: {
      transactionId,
      type: {
        in: [
          CashbackTransactionType.CREDIT_SELLER,
          CashbackTransactionType.CREDIT_BUYER,
        ],
      },
    },
    select: { id: true, userId: true, amountCents: true },
  })

  await Promise.all(
    credits.map((credit) =>
      tx.cashbackTransaction.create({
        data: {
          userId: credit.userId,
          type: CashbackTransactionType.REVERSAL,
          amountCents: credit.amountCents,
          transactionId,
          parentId: credit.id,
          description: 'Estorno de cashback por cancelamento pós-conclusão',
        },
      }),
    ),
  )
}

export async function assertSufficientBalance(
  tx: TxClient,
  userId: string,
  requiredCents: number,
): Promise<number> {
  const now = new Date()
  const rows = await tx.cashbackTransaction.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { type: true, amountCents: true },
  })

  const balance = rows.reduce((sum, row) => {
    const isCredit =
      row.type === CashbackTransactionType.CREDIT_SELLER ||
      row.type === CashbackTransactionType.CREDIT_BUYER ||
      row.type === CashbackTransactionType.REFUND_CANCELLATION
    return sum + (isCredit ? row.amountCents : -row.amountCents)
  }, 0)

  if (balance < requiredCents) {
    throw new Error('INSUFFICIENT_CASHBACK')
  }

  return balance
}
