import { beforeEach, describe, expect, test } from 'bun:test'
import { validate, version } from 'uuid'
import { hexToBytes, type Address } from 'viem'

import { buildIntentUrl, createIntent, decodeAbi, encodeAbi, verifyIntent } from '../src'

import { addr } from './helpers'

describe('Intent', () => {
  let zero: Address
  let recipient: Address
  let affiliate: Address

  beforeEach(() => {
    zero = addr(0)
    recipient = addr(1)
    affiliate = addr(2)
  })

  test('Create Intent', () => {
    const amount = '0.1'
    const i = createIntent({ asset: 'ARB.USDC', amount, recipient, affiliate })

    expect(validate(i.id)).toBe(true)
    expect(version(i.id)).toBe(7)
    expect(i.recipient).toBe(recipient)
    expect(i.affiliate).toBe(affiliate)
    expect(i.amount).toBe(amount)
    expect(i.asset).toBe('ARB.USDC')
  })

  test('Create Intent With Zero Recipient', () => {
    const amount = '0.1'
    expect(() => createIntent({ asset: 'ARB.USDC', amount, recipient: zero, affiliate })).toThrow()
  })

  test('Create Intent Without Affiliate', () => {
    const amount = '0.2'
    const i = createIntent({ asset: 'ARB.USDC', amount, recipient })

    expect(validate(i.id)).toBe(true)
    expect(version(i.id)).toBe(7)
    expect(i.recipient).toBe(recipient)
    expect(i.affiliate).toBe(zero)
    expect(i.amount).toBe(amount)
    expect(i.asset).toBe('ARB.USDC')
  })

  test('Create Intent Generates Valid Ids', () => {
    const first = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient })
    const second = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient })

    expect(validate(first.id)).toBe(true)
    expect(validate(second.id)).toBe(true)
    expect(version(first.id)).toBe(7)
    expect(version(second.id)).toBe(7)
  })

  test('Encode ABI', () => {
    const amount = '0.2'
    const i = createIntent({ asset: 'ARB.USDC', amount, recipient })
    const abi = encodeAbi(i)
    const intent = decodeAbi(abi!)
    const verify = verifyIntent(intent!)

    expect(hexToBytes(abi!).length).toBe(192)
    expect(i.id).toBe(intent!.id)
    expect(validate(intent!.id)).toBe(true)
    expect(version(intent!.id)).toBe(7)
    expect(intent!.amount).toBe(amount)
    expect(verify).toBe(true)
  })

  test('Corrupted ABI', () => {
    const corrupted = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient })
    corrupted.amount = '0.001'
    const abi = encodeAbi(corrupted)
    const intent = decodeAbi(abi!)
    const verify = verifyIntent(intent!)

    expect(hexToBytes(abi!).length).toBe(192)
    expect(verify).toBe(false)
  })

  test('Invalid data', () => {
    const corrupted = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient })
    corrupted.amount = '20'
    const abi = encodeAbi(corrupted)
    const intent = decodeAbi(abi!)
    const verify = verifyIntent(intent!)

    expect(hexToBytes(abi!).length).toBe(192)
    expect(verify).toBe(false)
  })

  test('Build url', () => {
    const intent = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient })
    const affiliateIntent = createIntent({ asset: 'ARB.USDC', amount: '0.2', recipient, affiliate })

    const basic = new URL(buildIntentUrl(intent))
    const withAffiliate = new URL(buildIntentUrl(affiliateIntent))
    const extra = new URL(buildIntentUrl({ ...affiliateIntent, extra: 'extra' }))

    expect(basic.origin).toBe('https://seedpay.app')
    expect(validate(basic.searchParams.get('id'))).toBe(true)
    expect(version(basic.searchParams.get('id')!)).toBe(7)
    expect(basic.searchParams.get('recipient')).toBe(recipient)
    expect(basic.searchParams.get('amount')).toBe('0.2')
    expect(basic.searchParams.get('asset')).toBeNull()

    expect(withAffiliate.searchParams.get('affiliate')).toBe(affiliate)
    expect(extra.searchParams.get('extra')).toBe('extra')
  })
})
