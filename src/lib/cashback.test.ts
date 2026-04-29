import { describe, it, expect } from 'vitest'
import {
  calcSellerCashback,
  calcBuyerCashback,
  calcMaxUsage,
} from './cashback'

describe('calcSellerCashback', () => {
  it('returns 5% of amount, floored', () => {
    expect(calcSellerCashback(10000)).toBe(500)
    expect(calcSellerCashback(10001)).toBe(500)
    expect(calcSellerCashback(0)).toBe(0)
  })
})

describe('calcBuyerCashback', () => {
  it('returns 2% of amount, floored', () => {
    expect(calcBuyerCashback(10000)).toBe(200)
    expect(calcBuyerCashback(10050)).toBe(201)
    expect(calcBuyerCashback(0)).toBe(0)
  })
})

describe('calcMaxUsage', () => {
  it('returns 30% of amount, floored', () => {
    expect(calcMaxUsage(10000)).toBe(3000)
    expect(calcMaxUsage(10001)).toBe(3000)
    expect(calcMaxUsage(0)).toBe(0)
  })

  it('caps usage at 30% even when balance is higher', () => {
    const total = 5000
    const cap = calcMaxUsage(total)
    expect(cap).toBe(1500)
    expect(cap).toBeLessThanOrEqual(total * 0.30)
  })
})
