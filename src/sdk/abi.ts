import * as v from 'valibot'
import {
  decodeAbiParameters,
  encodeAbiParameters,
  formatUnits,
  InvalidAddressError,
  isAddressEqual,
  hexToBytes,
  parseUnits,
  toHex,
} from 'viem'
import { parse as parseUuid, stringify as stringifyUuid } from 'uuid'

import { ASSETS, DESTINATION_ASSETS } from '../assets'
import { INTENT_ABI_PARAMS } from '../constants'
import { intent } from '../types'

import type { Hex } from 'viem'
import type { Intent } from '../types'

export function decodeAbi(abi: Hex): Intent {
  const [chain, address, recipient, affiliate, units, idHex] = decodeAbiParameters(INTENT_ABI_PARAMS, abi)
  const asset = DESTINATION_ASSETS.find((assetId) => {
    const candidate = ASSETS[assetId]
    return candidate.chain === chain && isAddressEqual(candidate.address, address)
  })
  if (!asset) throw new InvalidAddressError({ address })
  const id = stringifyUuid(hexToBytes(idHex))
  const amount = formatUnits(units, ASSETS[asset].decimals)
  return { id, asset, recipient, affiliate, amount }
}

export function encodeAbi(params: Intent): Hex {
  const parsed = v.parse(intent, params)
  const { chain, address, decimals } = ASSETS[parsed.asset]
  const units = parseUnits(parsed.amount, decimals)
  const { id, recipient, affiliate } = parsed
  return encodeAbiParameters(INTENT_ABI_PARAMS, [chain, address, recipient, affiliate, units, toHex(parseUuid(id))])
}
