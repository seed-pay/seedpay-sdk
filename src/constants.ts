import { Big } from 'big.js'

export const EVM_MESSAGE_LENGTH_BYTES = 192
export const EVM_GAS_BUDGET = 200_000

export const BPS = Big(10000)
export const MIN_SLIPPAGE_BPS = Big(100)

export const INTENT_ABI_PARAMS = [
  { type: 'uint32' }, // chain
  { type: 'address' }, // token
  { type: 'address' }, // recipient
  { type: 'address' }, // affiliate
  { type: 'uint256' }, // amount (units)
  { type: 'bytes16' }, // id (nonce + hash)
] as const
