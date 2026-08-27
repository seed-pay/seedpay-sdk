import { checkAddress } from '@polkadot/util-crypto'
import { Network, validate } from 'bitcoin-address-validation'
import { formatUnits, isAddress } from 'viem'

import { isSolanaAddress, isTronAddress } from './address'
import { ASSETS, ChainEnum, DESTINATION_ASSETS } from './assets'

import { SETTLEMENT_STATUS } from './constants'
import type { AssetId, Chain, DestAsset, Processed, Settlement } from './types'

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

export const mapToSettlement = (processed: Processed): Settlement | null => {
  const {
    id,
    token,
    chainId,
    intentAmount,
    recipientAmount,
    recipient,
    affiliate,
    transactionHash,
    timestamp,
    address: contract,
  } = processed

  const asset = getAssetByAddress(token, chainId) as DestAsset | null

  if (!asset) return null
  if (!DESTINATION_ASSETS.includes(asset)) return null

  const assetDef = ASSETS[asset]
  const amount = formatUnits(BigInt(intentAmount), assetDef.decimals)
  const receivedAmount = formatUnits(BigInt(recipientAmount), assetDef.decimals)
  const status = SETTLEMENT_STATUS[processed.status] ?? 'INSUFFICIENT'

  return {
    id,
    asset,
    recipient,
    affiliate,
    amount,
    receivedAmount,
    transactionHash,
    timestamp,
    contract,
    status,
  }
}
