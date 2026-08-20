import { describe, expect, test } from 'bun:test'

import { ChainEnum, validateAddress } from '../src'

describe('Utils', () => {
  test('Validate Good Addresses', () => {
    expect(validateAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', ChainEnum.BTC)).toBe(true)
    expect(validateAddress('0xdac17f958d2ee523a2206206994597c13d831ec7', ChainEnum.ETH)).toBe(true)
    expect(validateAddress('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', ChainEnum.SOL)).toBe(true)
    expect(validateAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', ChainEnum.TRX)).toBe(true)
  })

  test('Validate Bad Addresses', () => {
    expect(validateAddress('0xdac17f958d2ee523a2206206994597c13d831ec7', ChainEnum.BTC)).toBe(false)
    expect(validateAddress('0xdac17f958d2', ChainEnum.ETH)).toBe(false)
    expect(validateAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', ChainEnum.SOL)).toBe(false)
    expect(validateAddress('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', ChainEnum.TRX)).toBe(false)
  })
})
