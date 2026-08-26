/**
 * Repasse ao consignante na Kloop Shop — faixas por valor da peça.
 *
 * A Kloop faz todo o trabalho por peça (foto, anúncio, guarda, envio), então
 * o repasse é escalonado: peças baratas dão mais margem pra Kloop (o custo de
 * fotografar/anunciar é quase o mesmo de uma peça cara), peças caras dão mais
 * repasse ao consignante (o valor absoluto já compensa a Kloop mesmo com fatia
 * menor). Ver docs/kloop-doc/04-modelo-negocio-financeiro.md para a análise
 * completa que motivou essas faixas.
 */

const TIER_LOW_MAX_CENTS = 7999 // até R$79,99
const TIER_MID_MAX_CENTS = 29999 // R$80,00 a R$299,99 — acima disso é a faixa alta

const CONSIGNOR_RATE_LOW = 0.45 // até R$79,99: consignante 45% / Kloop 55%
const CONSIGNOR_RATE_MID = 0.55 // R$80,00–R$299,99: consignante 55% / Kloop 45%
const CONSIGNOR_RATE_HIGH = 0.65 // R$300,00+: consignante 65% / Kloop 35%

export function getConsignorShareRate(priceCents: number): number {
  if (priceCents <= TIER_LOW_MAX_CENTS) return CONSIGNOR_RATE_LOW
  if (priceCents <= TIER_MID_MAX_CENTS) return CONSIGNOR_RATE_MID
  return CONSIGNOR_RATE_HIGH
}

export function calcConsignorPayout(priceCents: number): number {
  return Math.floor(priceCents * getConsignorShareRate(priceCents))
}
