import { Network, validate } from 'bitcoin-address-validation'
import { isAddress } from 'viem'

import { isSolanaAddress, isTronAddress } from './address'
import { ASSETS, ChainEnum } from './assets'

import type { AssetId, Chain } from './types'

export const validateAddress = (address: string, chain: Chain): boolean => {
  if (chain === ChainEnum.BTC) return validate(address, Network.mainnet)
  if (chain === ChainEnum.SOL) return isSolanaAddress(address)
  if (chain === ChainEnum.TRX) return isTronAddress(address)
  return !!isAddress(address)
}

export const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

export const getAssetByAddress = (address: string, chain: Chain): AssetId | null => {
  const entry = Object.entries(ASSETS).find(
    ([, asset]) => asset.chain === chain && asset.address.toLowerCase() === address.toLowerCase()
  )
  return (entry?.[0] as AssetId) ?? null
}
