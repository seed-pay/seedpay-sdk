import { parse, stringify } from 'uuid'
import * as v from 'valibot'
import {
  decodeAbiParameters,
  encodeAbiParameters,
  formatUnits,
  hexToBytes,
  InvalidAddressError,
  isAddress,
  isAddressEqual,
  parseUnits,
  toHex,
  zeroAddress,
} from 'viem'

import { ASSETS, DESTINATION_ASSETS } from '../assets'
import { INTENT_ABI_PARAMS } from '../constants'
import { intent } from '../types'

import type { Address, Hex } from 'viem'
import type { Intent } from '../types'

const toAddress = (value: string): Address => {
  if (!isAddress(value)) throw new Error('Invalid EVM address')
  return value
}

export function decodeAbi(abi: Hex): Intent {
  const [chain, address, recipient, affiliateAddress, units, idHex] = decodeAbiParameters(INTENT_ABI_PARAMS, abi)
  const asset = DESTINATION_ASSETS.find((assetId) => {
    const candidate = ASSETS[assetId]
    return candidate.chain === chain && isAddressEqual(candidate.address, address)
  })
  if (!asset) throw new InvalidAddressError({ address })
  const id = stringify(hexToBytes(idHex))
  const amount = formatUnits(units, ASSETS[asset].decimals)
  const affiliate = isAddressEqual(affiliateAddress, zeroAddress) ? undefined : affiliateAddress
  return { id, asset, recipient, ...(affiliate && { affiliate }), amount }
}

export function encodeAbi(params: Intent): Hex {
  const parsed = v.parse(intent, params)
  const { chain, address, decimals } = ASSETS[parsed.asset]
  const { id, recipient, affiliate = zeroAddress, amount } = parsed

  const token = toAddress(address)
  const recipientAddress = toAddress(recipient)
  const affiliateAddress = toAddress(affiliate)
  const units = parseUnits(amount, decimals)

  return encodeAbiParameters(INTENT_ABI_PARAMS, [
    chain,
    token,
    recipientAddress,
    affiliateAddress,
    units,
    toHex(parse(id)),
  ])
}
