import type { DestAsset } from './types'

export const ARB_DESTINATION = '0x8c67c7468A0F9FB3d644850aC42B7b674f02F5DB' as const

export const DEFAULT_CHAINFLIP_RPC = 'https://rpc.mainnet.chainflip.io' as const
export const DEFAULT_CHAINFLIP_API = 'https://chainflip-swap.chainflip.io' as const

export const DEFAULT_SEED_PAY_HOST = 'https://seedpay.app/pay' as const
export const DEFAULT_SEED_API = 'https://api.seedpay.app' as const

export const DESTINATION_ADDRESSES: Record<DestAsset, string> = {
  'ARB.USDC': ARB_DESTINATION,
  'ARB.USDT': ARB_DESTINATION,
  'ARB.ETH': ARB_DESTINATION,
} as const
