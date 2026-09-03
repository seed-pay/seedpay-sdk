import { filterQuery, withQuery } from 'ufo'
import { parse, stringify, v7 } from 'uuid'
import * as v from 'valibot'
import { encodeAbiParameters, keccak256, parseUnits, toBytes, toHex, zeroAddress } from 'viem'

import { ASSETS } from '../assets'
import { DEFAULT_SEED_PAY_HOST } from '../configs'
import { BASE_ABI_PARAMS } from '../constants'
import { intent, intentParams } from '../types'

import type { Intent, IntentParams } from '../types'

const HASH_BYTES = 6
const NONCE_BYTES = 10

export function createIntent(params: IntentParams): Intent {
  const parsed = v.parse(intentParams, params)
  const { asset, amount, recipient, affiliate = zeroAddress } = parsed

  const assetMeta = ASSETS[asset]
  const chain = assetMeta.chain
  const token = assetMeta.address
  const units = parseUnits(amount, assetMeta.decimals)

  const idBytes = parse(v7())
  const nonce = toHex(idBytes.slice(0, NONCE_BYTES))

  const abi = encodeAbiParameters(BASE_ABI_PARAMS, [chain, token, recipient, affiliate, units, nonce])
  const hashBytes = toBytes(keccak256(abi)).slice(0, HASH_BYTES)
  idBytes.set(hashBytes, NONCE_BYTES)

  return { id: stringify(idBytes), asset, recipient, affiliate, amount }
}

export function verifyIntent(params: Intent): boolean {
  const parsed = v.parse(intent, params)
  const { chain, address, decimals } = ASSETS[parsed.asset]
  const { id, recipient, affiliate = zeroAddress } = parsed

  const units = parseUnits(parsed.amount, decimals)
  const idBytes = parse(id)
  const nonce = toHex(idBytes.slice(0, NONCE_BYTES))

  const abi = encodeAbiParameters(BASE_ABI_PARAMS, [chain, address, recipient, affiliate, units, nonce])
  const hashBytes = toBytes(keccak256(abi)).slice(0, HASH_BYTES)

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
    ...(affiliate !== zeroAddress && { affiliate }),
    amount,
    ...extra,
  }

  return filterQuery(withQuery(host, query), (_, value) => value != null && value !== '')
}
