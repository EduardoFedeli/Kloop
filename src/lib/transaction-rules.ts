import { TransactionStatus } from '@prisma/client'

export type ActorRole = 'buyer' | 'seller'

interface TransitionRule {
  from: TransactionStatus
  to: TransactionStatus
  actor: ActorRole
}

const VALID_TRANSITIONS: TransitionRule[] = [
  { from: 'PENDING', to: 'PAID', actor: 'buyer' },
  { from: 'PENDING', to: 'CANCELLED', actor: 'buyer' },
  { from: 'PAID', to: 'SHIPPED', actor: 'seller' },
  { from: 'PAID', to: 'CANCELLED', actor: 'seller' },
  { from: 'SHIPPED', to: 'DELIVERED', actor: 'buyer' },
  { from: 'DELIVERED', to: 'COMPLETED', actor: 'buyer' },
]

const ACTOR_LABEL: Record<ActorRole, string> = {
  buyer: 'comprador',
  seller: 'vendedor',
}

export function canTransitionTo(
  from: TransactionStatus,
  to: TransactionStatus,
  actorRole: ActorRole,
): true | { error: string } {
  if (from === to) {
    return { error: 'Transição inválida: o status já é o mesmo.' }
  }

  const rule = VALID_TRANSITIONS.find((r) => r.from === from && r.to === to)

  if (!rule) {
    return { error: `Transição de ${from} para ${to} não é permitida.` }
  }

  if (rule.actor !== actorRole) {
    return {
      error: `Apenas o ${ACTOR_LABEL[rule.actor]} pode realizar esta ação.`,
    }
  }

  return true
}
