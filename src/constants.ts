import { Big } from 'big.js'
import type { SettlementStatus } from './types'

export const EVM_MESSAGE_LENGTH_BYTES = 192
export const EVM_GAS_BUDGET = 200_000

export const BPS = Big(10000)
export const MIN_SLIPPAGE_BPS = Big(100)

export const BASE_ABI_PARAMS = [
  { type: 'uint32' }, // chain
  { type: 'address' }, // token
  { type: 'address' }, // recipient
  { type: 'address' }, // affiliate
  { type: 'uint256' }, // amount (units)
  { type: 'bytes10' }, // nonce
] as const

export const INTENT_ABI_PARAMS = [
  { type: 'uint32' }, // chain
  { type: 'address' }, // token
  { type: 'address' }, // recipient
  { type: 'address' }, // affiliate
  { type: 'uint256' }, // amount (units)
  { type: 'bytes16' }, // id (nonce + hash)
] as const

export const SETTLEMENT_STATUS: Record<number, SettlementStatus> = {
  0: 'INSUFFICIENT',
  1: 'EXACT',
  2: 'EXCESS',
}
