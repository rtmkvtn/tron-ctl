import { describe, it, expect } from 'vitest'
import { assignColorIndex, defaultLabel } from '../lib'

describe('assignColorIndex', () => {
  it('returns totalCount % 10 for inputs 0–19', () => {
    for (let i = 0; i < 20; i++) {
      expect(assignColorIndex(i)).toBe(i % 10)
    }
  })
})

describe('defaultLabel', () => {
  it('returns "Wallet N" where N = totalCount + 1', () => {
    expect(defaultLabel(0)).toBe('Wallet 1')
    expect(defaultLabel(4)).toBe('Wallet 5')
    expect(defaultLabel(9)).toBe('Wallet 10')
  })
})
