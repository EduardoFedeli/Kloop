import { describe, it, expect } from 'vitest'
import { canTransitionTo } from './transaction-rules'

describe('canTransitionTo', () => {
  // ── Transições válidas ──────────────────────────────────────

  it('comprador pode ir de PENDING para PAID', () => {
    expect(canTransitionTo('PENDING', 'PAID', 'buyer')).toBe(true)
  })

  it('comprador pode cancelar de PENDING', () => {
    expect(canTransitionTo('PENDING', 'CANCELLED', 'buyer')).toBe(true)
  })

  it('vendedor pode ir de PAID para SHIPPED', () => {
    expect(canTransitionTo('PAID', 'SHIPPED', 'seller')).toBe(true)
  })

  it('vendedor pode cancelar de PAID', () => {
    expect(canTransitionTo('PAID', 'CANCELLED', 'seller')).toBe(true)
  })

  it('comprador pode ir de SHIPPED para DELIVERED', () => {
    expect(canTransitionTo('SHIPPED', 'DELIVERED', 'buyer')).toBe(true)
  })

  it('comprador pode ir de DELIVERED para COMPLETED', () => {
    expect(canTransitionTo('DELIVERED', 'COMPLETED', 'buyer')).toBe(true)
  })

  // ── Actor errado ────────────────────────────────────────────

  it('vendedor não pode pagar (PENDING → PAID)', () => {
    const result = canTransitionTo('PENDING', 'PAID', 'seller')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  it('comprador não pode marcar como enviado (PAID → SHIPPED)', () => {
    const result = canTransitionTo('PAID', 'SHIPPED', 'buyer')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  it('vendedor não pode marcar como entregue (SHIPPED → DELIVERED)', () => {
    const result = canTransitionTo('SHIPPED', 'DELIVERED', 'seller')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  it('vendedor não pode concluir a compra (DELIVERED → COMPLETED)', () => {
    const result = canTransitionTo('DELIVERED', 'COMPLETED', 'seller')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  it('comprador não pode cancelar de PAID (só vendedor pode)', () => {
    const result = canTransitionTo('PAID', 'CANCELLED', 'buyer')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  it('vendedor não pode cancelar de PENDING (só comprador pode)', () => {
    const result = canTransitionTo('PENDING', 'CANCELLED', 'seller')
    expect(result).not.toBe(true)
    expect(result).toHaveProperty('error')
  })

  // ── Transições inexistentes ─────────────────────────────────

  it('ninguém pode pular de PENDING para SHIPPED', () => {
    expect(canTransitionTo('PENDING', 'SHIPPED', 'seller')).toHaveProperty('error')
    expect(canTransitionTo('PENDING', 'SHIPPED', 'buyer')).toHaveProperty('error')
  })

  it('ninguém pode pular de PENDING para COMPLETED', () => {
    expect(canTransitionTo('PENDING', 'COMPLETED', 'buyer')).toHaveProperty('error')
    expect(canTransitionTo('PENDING', 'COMPLETED', 'seller')).toHaveProperty('error')
  })

  it('ninguém pode voltar de SHIPPED para PAID', () => {
    expect(canTransitionTo('SHIPPED', 'PAID', 'buyer')).toHaveProperty('error')
    expect(canTransitionTo('SHIPPED', 'PAID', 'seller')).toHaveProperty('error')
  })

  it('ninguém pode cancelar de SHIPPED', () => {
    expect(canTransitionTo('SHIPPED', 'CANCELLED', 'buyer')).toHaveProperty('error')
    expect(canTransitionTo('SHIPPED', 'CANCELLED', 'seller')).toHaveProperty('error')
  })

  it('ninguém pode cancelar de COMPLETED', () => {
    expect(canTransitionTo('COMPLETED', 'CANCELLED', 'buyer')).toHaveProperty('error')
    expect(canTransitionTo('COMPLETED', 'CANCELLED', 'seller')).toHaveProperty('error')
  })

  // ── Idempotência ────────────────────────────────────────────

  it('transição para o mesmo status retorna erro (idempotência)', () => {
    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'] as const
    for (const status of statuses) {
      expect(canTransitionTo(status, status, 'buyer')).toHaveProperty('error')
      expect(canTransitionTo(status, status, 'seller')).toHaveProperty('error')
    }
  })
})
