import * as v from 'valibot'
import { isAddress, zeroAddress } from 'viem'

import { ASSET_LIST, ASSETS, DESTINATION_ASSETS } from './assets'

import type { Address } from 'viem'

// --- primitives ---

export const asset = v.picklist(ASSET_LIST)
export const destAssetId = v.picklist(DESTINATION_ASSETS)
export const settlementStatus = v.picklist(['INSUFFICIENT', 'EXACT', 'EXCESS'])
export const depositStatus = v.picklist([
  'WAITING',
  'RECEIVING',
  'SWAPPING',
  'SENDING',
  'SENT',
  'COMPLETED',
  'EXPIRED',
  'FAILED',
])

export const uint = v.pipe(v.string(), v.regex(/^(0|[1-9]\d*)$/, 'Must be an unsigned integer'))
export const amount = v.pipe(v.string(), v.regex(/^(0|[1-9]\d*)(\.\d+)?$/, 'Must be a numeric amount'))

export const address = v.pipe(
  v.string(),
  v.custom<Address>((v) => isAddress(v as string), 'Invalid address')
)

export const nonZeroAddress = v.pipe(
  address,
  v.custom((v) => v !== zeroAddress, 'Zero address not allowed')
)

export const id = v.pipe(
  v.string(),
  v.regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'Invalid id')
)

// --- schemas ---

export const quoteParams = v.object({
  srcAsset: asset,
  destAsset: destAssetId,
  amount: uint,
})

export const quote = v.object({
  srcAsset: asset,
  srcAmount: uint,
  destAsset: destAssetId,
  destAmount: uint,
  slippage: uint,
  minPriceX128: uint,
  quote: v.any(),
})

export const intentParams = v.object({
  asset: destAssetId,
  recipient: nonZeroAddress,
  affiliate: v.optional(address),
  amount,
})

export const intent = v.object({
  id,
  asset: destAssetId,
  recipient: nonZeroAddress,
  affiliate: address,
  amount,
})

export const settlement = v.intersect([
  intent,
  v.object({
    receivedAmount: amount,
    status: settlementStatus,
    transactionHash: v.string(),
    timestamp: v.string(),
    contract: v.string(),
  }),
])

export const depositParams = v.object({
  refundAddress: v.string(),
  intent,
  quote,
})

export const depositRef = v.string()

export const deposit = v.object({
  ref: v.string(),
  srcAsset: asset,
  srcAmount: uint,
  depositAddress: v.string(),
  depositAmount: v.optional(v.string()),
  depositTx: v.optional(v.string()),
  destTx: v.optional(v.string()),
  refundAddress: v.string(),
  refundAmount: v.optional(v.string()),
  refundTx: v.optional(v.string()),
  status: depositStatus,
  completedAt: v.optional(v.number()),
  expireAt: v.number(),
  intent,
})

// --- types ---

export type Uint = v.InferOutput<typeof uint>

export type AssetId = keyof typeof ASSETS
export type Asset = (typeof ASSETS)[AssetId]
export type DestAsset = (typeof DESTINATION_ASSETS)[number]
export type AssetStandard = Asset['standard']
export type Chain = Asset['chain']
export type Symbol = Asset['symbol']

export type QuoteParams = v.InferOutput<typeof quoteParams>
export type Quote = v.InferOutput<typeof quote>

export type DepositParams = v.InferOutput<typeof depositParams>
export type DepositStatus = v.InferOutput<typeof depositStatus>
export type Deposit = v.InferOutput<typeof deposit>

export type IntentParams = v.InferOutput<typeof intentParams>
export type Intent = v.InferOutput<typeof intent>
export type Settlement = v.InferOutput<typeof settlement>
export type SettlementStatus = v.InferOutput<typeof settlementStatus>

export type Processed = {
  id: string
  address: Address
  token: Address
  recipient: Address
  affiliate: Address
  chainId: number
  srcChainId: number
  srcAddress: null
  intentAmount: string
  protocolAmount: string
  affiliateAmount: string
  recipientAmount: string
  transactionHash: string
  blockHash: string
  blockNumber: string
  logIndex: number
  timestamp: string
  status: number
}
