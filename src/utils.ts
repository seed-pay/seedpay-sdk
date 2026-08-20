import { Network, validate as validateBTC } from 'bitcoin-address-validation'
import { isAddress as validateSOL } from 'gill/browser'
import { isAddress as validateEVM } from 'viem'

import { ASSETS, ChainEnum } from './assets'
import { isAddress as validateTRX } from './tron'

import type { AssetId, Chain } from './types'

export const validateAddress = (address: string, chain: Chain): boolean => {
  if (chain === ChainEnum.BTC) return validateBTC(address, Network.mainnet)
  if (chain === ChainEnum.SOL) return validateSOL(address)
  if (chain === ChainEnum.TRX) return validateTRX(address)
  return !!validateEVM(address)
}

export const keys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

export const getAssetByAddress = (address: string, chain: Chain): AssetId | null => {
  const entry = Object.entries(ASSETS).find(
    ([, asset]) => asset.chain === chain && asset.address.toLowerCase() === address.toLowerCase()
  )
  return (entry?.[0] as AssetId) ?? null
}
