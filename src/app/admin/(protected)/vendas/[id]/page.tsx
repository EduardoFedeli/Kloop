import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { formatPrice, formatDate, cn } from "@/lib/utils"
import { ArrowLeft, User, Tag, MapPin, CreditCard, Clock } from "lucide-react"

export const metadata: Metadata = { title: "Detalhe da Transação — Admin Kloop" }

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  DISPUTED: "Em disputa",
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PAID: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-teal-100 text-teal-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  REFUNDED: "bg-red-100 text-red-700",
  DISPUTED: "bg-red-200 text-red-800",
}

const CASHBACK_TYPE_LABELS: Record<string, string> = {
  CREDIT_SELLER: "Cashback vendedor",
  CREDIT_BUYER: "Cashback comprador",
  DEBIT_PURCHASE: "Usado no checkout",
  REFUND_CANCELLATION: "Devolução de cashback",
  REVERSAL: "Estorno",
  EXPIRATION: "Expirado",
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  BOLETO: "Boleto",
  PLATFORM_CREDIT: "Crédito da plataforma",
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Novo",
  LIKE_NEW: "Seminovo",
  GOOD: "Bom",
  FAIR: "Regular",
}

const TIMELINE_STEPS = [
  { status: "PENDING", label: "Criado" },
  { status: "AWAITING_PAYMENT", label: "Aguard. pagamento" },
  { status: "PAID", label: "Pago" },
  { status: "SHIPPED", label: "Enviado" },
  { status: "DELIVERED", label: "Entregue" },
  { status: "COMPLETED", label: "Concluído" },
]

const TERMINAL_STATUSES = new Set(["CANCELLED", "REFUNDED", "DISPUTED"])

export default async function AdminTransacaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          subscription: {
            select: { plan: { select: { name: true, slug: true, commissionRate: true } } },
          },
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

  if (!transaction) notFound()

  const commissionRate = Number(transaction.commissionRate)
  const netSeller = transaction.amountCents - transaction.commissionCents + transaction.cashbackUsedCents
  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.status === transaction.status)
  const isTerminal = TERMINAL_STATUSES.has(transaction.status)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/vendas"
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[18px] font-black text-gray-900">Transação</h1>
          <p className="font-mono text-[12px] text-gray-400">{transaction.id}</p>
        </div>
        <span
          className={cn(
            "ml-auto px-3 py-1.5 rounded-full text-[12px] font-bold",
            STATUS_COLORS[transaction.status] ?? "bg-gray-100 text-gray-500"
          )}
        >
          {STATUS_LABELS[transaction.status] ?? transaction.status}
        </span>
      </div>

      {/* Timeline */}
      {!isTerminal ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock size={13} /> Timeline
          </p>
          <div className="flex items-start gap-0">
            {TIMELINE_STEPS.map((step, i) => {
              const done = currentStepIdx >= i
              const active = currentStepIdx === i
              const isLast = i === TIMELINE_STEPS.length - 1
              return (
                <div key={step.status} className="flex items-start flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors",
                        done ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" : "bg-white border-gray-200 text-gray-300",
                        active && "ring-2 ring-[var(--color-teal)]/30"
                      )}
                    >
                      {i + 1}
                    </div>
                    <p className={cn("text-[10px] font-bold mt-1 text-center max-w-[56px] leading-tight", done ? "text-gray-700" : "text-gray-300")}>
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={cn("flex-1 h-0.5 mt-3", done && currentStepIdx > i ? "bg-[var(--color-teal)]" : "bg-gray-100")} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <p className="text-[13px] font-bold text-red-700">
            Transação encerrada com status <strong>{STATUS_LABELS[transaction.status]}</strong>
            {transaction.cancelledAt ? ` em ${formatDate(transaction.cancelledAt)}` : "."}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Partes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <User size={13} /> Partes envolvidas
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Comprador</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.buyer.name}</p>
              <p className="text-[12px] text-gray-500">{transaction.buyer.email}</p>
            </div>
            <div className="border-t border-gray-50 pt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vendedor</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.seller.name}</p>
              <p className="text-[12px] text-gray-500">{transaction.seller.email}</p>
              {transaction.seller.subscription && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                  {transaction.seller.subscription.plan.name} ·{" "}
                  {(Number(transaction.seller.subscription.plan.commissionRate) * 100).toFixed(0)}% comissão
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Produto */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Tag size={13} /> Produto
          </p>
          <div className="flex gap-3">
            {transaction.listing.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={transaction.listing.images[0].url}
                alt={transaction.listing.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
            )}
            <div>
              <p className="text-[14px] font-bold text-gray-900 leading-snug">{transaction.listing.title}</p>
              <p className="text-[12px] text-gray-500 mt-1">
                {CONDITION_LABELS[transaction.listing.condition] ?? transaction.listing.condition}
              </p>
              <p className="text-[13px] font-bold text-gray-700 mt-1">
                Preço original: {formatPrice(transaction.listing.priceCents)}
              </p>
            </div>
          </div>
          {transaction.paymentMethod && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
              <CreditCard size={13} className="text-gray-400" />
              <p className="text-[12px] text-gray-600">
                {PAYMENT_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown financeiro */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-4">Breakdown financeiro</p>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-gray-600">Valor da transação</span>
            <span className="text-[14px] font-black text-gray-900">{formatPrice(transaction.amountCents)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-gray-600">
              Comissão Kloop ({(commissionRate * 100).toFixed(0)}%)
            </span>
            <span className="text-[14px] font-bold text-green-700">+{formatPrice(transaction.commissionCents)}</span>
          </div>
          {transaction.cashbackUsedCents > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-600">Cashback usado pelo comprador</span>
              <span className="text-[14px] font-bold text-red-500">−{formatPrice(transaction.cashbackUsedCents)}</span>
            </div>
          )}
          {transaction.shippingCents > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-600">Frete</span>
              <span className="text-[14px] font-bold text-gray-700">{formatPrice(transaction.shippingCents)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
            <span className="text-[13px] font-bold text-gray-700">Líquido para o vendedor</span>
            <span className="text-[15px] font-black text-gray-900">{formatPrice(netSeller)}</span>
          </div>
        </div>
      </div>

      {/* Eventos de cashback */}
      {transaction.cashbackTransactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-4">Eventos de cashback</p>
          <div className="space-y-0">
            {transaction.cashbackTransactions.map((ct) => (
              <div key={ct.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-[12px] font-bold text-gray-800">
                    {CASHBACK_TYPE_LABELS[ct.type] ?? ct.type} — {ct.user.name}
                  </p>
                  <p className="text-[11px] text-gray-400">{ct.description}</p>
                </div>
                <span className={cn("text-[13px] font-black", ct.type.startsWith("CREDIT") ? "text-green-700" : "text-red-500")}>
                  {ct.type.startsWith("CREDIT") ? "+" : "−"}{formatPrice(ct.amountCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endereço */}
      {transaction.address && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-[12px] font-black text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin size={13} /> Endereço de entrega
          </p>
          <p className="text-[13px] text-gray-700">
            {transaction.address.street}, {transaction.address.number}
            {transaction.address.complement ? `, ${transaction.address.complement}` : ""} —{" "}
            {transaction.address.neighborhood}
          </p>
          <p className="text-[13px] text-gray-700">
            {transaction.address.city} / {transaction.address.state} · CEP {transaction.address.zipCode}
          </p>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Criado", value: transaction.createdAt },
            { label: "Pago", value: transaction.paidAt },
            { label: "Enviado", value: transaction.shippedAt },
            { label: "Concluído", value: transaction.completedAt },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
              <p className="text-[12px] text-gray-700">{value ? formatDate(value) : "—"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
