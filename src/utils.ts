import { checkAddress } from '@polkadot/util-crypto'
import { Network, validate } from 'bitcoin-address-validation'
import { formatUnits, isAddress } from 'viem'

import { isSolanaAddress, isTronAddress } from './address'
import { ASSETS, ChainEnum, DESTINATION_ASSETS } from './assets'

import type { AssetId, Chain, DestAsset, Payment, PaymentStatus, Settlement } from './types'

export const validateAddress = (address: string, chain: Chain): boolean => {
  if (chain === ChainEnum.BTC) return validate(address, Network.mainnet)
  if (chain === ChainEnum.SOL) return isSolanaAddress(address)
  if (chain === ChainEnum.TRX) return isTronAddress(address)
  if (chain === ChainEnum.DOT) return checkAddress(address, 0)[0]
  return !!isAddress(address)
}

export const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

export const getAssetByAddress = (address: string, chain: Chain): AssetId | null => {
  const entry = Object.entries(ASSETS).find(
    ([, asset]) => asset.chain === chain && asset.address.toLowerCase() === address.toLowerCase()
  )
  return (entry?.[0] as AssetId) ?? null
}

export const mapToPayment = (settlements: Settlement[]): Payment | null => {
  const settlement = settlements.at(0)
  if (!settlement) return null

  const asset = getAssetByAddress(settlement.token, settlement.chainId) as DestAsset | null

  if (!asset || !DESTINATION_ASSETS.includes(asset)) return null
  const assetDef = ASSETS[asset]

  const { id, intentAmount, recipient, affiliate } = settlement

  const totalUnits = settlements.reduce((sum, { recipientAmount }) => sum + BigInt(recipientAmount), 0n)
  const amountUnits = BigInt(intentAmount)

  const amount = formatUnits(amountUnits, assetDef.decimals)
  const totalAmount = formatUnits(totalUnits, assetDef.decimals)

  let status: PaymentStatus
  if (totalUnits < amountUnits) {
    status = 'INSUFFICIENT'
  } else if (totalUnits === amountUnits) {
    status = 'EXACT'
  } else {
    status = 'EXCESS'
  }

  return { id, asset, recipient, affiliate, amount, totalAmount, status, settlements }
}
