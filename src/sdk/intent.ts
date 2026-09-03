import { filterQuery, withQuery } from 'ufo'
import { parse, stringify, v7 } from 'uuid'
import * as v from 'valibot'
import { concatBytes, keccak256, parseUnits, stringToBytes, toBytes } from 'viem'

import { ASSETS } from '../assets'
import { DEFAULT_SEED_PAY_HOST } from '../configs'
import { intent, intentParams } from '../types'
import { validateAddress } from '../utils'

import type { Intent, IntentParams } from '../types'

const HASH_BYTES = 6
const NONCE_BYTES = 10

export function createIntent(params: IntentParams): Intent {
  const parsed = v.parse(intentParams, params)
  const { asset, amount, recipient, affiliate } = parsed
  const { chain, address, decimals } = ASSETS[asset]

  if (!validateAddress(recipient, chain, false)) throw new Error('Recipient address is invalid')
  if (affiliate && !validateAddress(affiliate, chain, false)) throw new Error('Affiliate address is invalid')

  const chainBytes = stringToBytes(String(chain))
  const tokenBytes = stringToBytes(address.toLowerCase().trim())
  const recipientBytes = stringToBytes(recipient.toLowerCase())
  const affiliateBytes = affiliate ? stringToBytes(affiliate.toLowerCase()) : new Uint8Array(0)
  const amountBytes = stringToBytes(parseUnits(amount, decimals).toString())

  const idBytes = parse(v7())
  const nonceBytes = idBytes.slice(0, NONCE_BYTES)

  const payload = concatBytes([chainBytes, tokenBytes, recipientBytes, affiliateBytes, amountBytes, nonceBytes])
  const hashBytes = toBytes(keccak256(payload)).slice(0, HASH_BYTES)

  idBytes.set(hashBytes, NONCE_BYTES)
  const id = stringify(idBytes)

  return { id, asset, recipient, ...(affiliate && { affiliate }), amount }
}

export function verifyIntent(params: Intent): boolean {
  const parsed = v.parse(intent, params)
  const { asset, amount, recipient, affiliate, id } = parsed
  const { chain, address, decimals } = ASSETS[asset]

  if (!validateAddress(recipient, chain, false)) return false
  if (affiliate && !validateAddress(affiliate, chain, false)) return false

  const idBytes = parse(id)
  const chainBytes = stringToBytes(String(chain))
  const tokenBytes = stringToBytes(address.toLowerCase().trim())
  const recipientBytes = stringToBytes(recipient.toLowerCase())
  const affiliateBytes = affiliate ? stringToBytes(affiliate.toLowerCase()) : new Uint8Array(0)
  const amountBytes = stringToBytes(parseUnits(amount, decimals).toString())
  const nonceBytes = idBytes.slice(0, NONCE_BYTES)

  const payload = concatBytes([chainBytes, tokenBytes, recipientBytes, affiliateBytes, amountBytes, nonceBytes])
  const hashBytes = toBytes(keccak256(payload)).slice(0, HASH_BYTES)

  const expectedBytes = new Uint8Array(16)
  expectedBytes.set(idBytes.slice(0, NONCE_BYTES), 0)
  expectedBytes.set(hashBytes, NONCE_BYTES)
  return stringify(expectedBytes) === id
}

export function buildIntentUrl(params: Intent & Record<string, string>, host: string = DEFAULT_SEED_PAY_HOST): string {
  const { asset, affiliate, ...rest } = params
  const { amount, recipient, id, ...extra } = rest

  const query = {
    id,
    ...(asset !== 'ARB.USDC' && { asset }),
    recipient,
    ...(!!affiliate && { affiliate }),
    amount,
    ...extra,
  }

  return filterQuery(withQuery(host, query), (_, value) => value != null && value !== '')
}
