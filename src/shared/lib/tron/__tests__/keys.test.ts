// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../keys'

describe('generateKeypair', () => {
  it('returns a valid TRON address (T + 33 base58 chars)', () => {
    const { address } = generateKeypair()
    expect(address).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
  })

  it('returns a 64-char hex private key', () => {
    const { privateKey } = generateKeypair()
    expect(privateKey).toMatch(/^[0-9A-Fa-f]{64}$/)
  })

  it('generates unique keypairs', () => {
    const a = generateKeypair()
    const b = generateKeypair()
    expect(a.privateKey).not.toBe(b.privateKey)
    expect(a.address).not.toBe(b.address)
  })
})
