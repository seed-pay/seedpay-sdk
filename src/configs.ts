import type { DestAsset } from './types'

export const ARB_DESTINATION = '0x3a290686e199b94e223b5d19155802bb5fee242e' as const

export const DEFAULT_ARB_RPC = 'https://arbitrum-one-rpc.publicnode.com' as const

export const DEFAULT_CHAINFLIP_RPC = 'https://rpc.mainnet.chainflip.io' as const
export const DEFAULT_CHAINFLIP_API = 'https://chainflip-swap.chainflip.io' as const

export const DEFAULT_SEED_PAY_HOST = 'https://pay.seedpay.app' as const
export const DEFAULT_SEED_API = 'https://api.seedpay.app' as const

export const DESTINATION_ADDRESSES: Record<DestAsset, string> = {
  'ARB.USDC': ARB_DESTINATION,
  'ARB.USDT': ARB_DESTINATION,
  'ARB.ETH': ARB_DESTINATION,
} as const
