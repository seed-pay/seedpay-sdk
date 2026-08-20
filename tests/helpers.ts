import { numberToHex } from 'viem'

export const addr = (n: number) => numberToHex(n, { size: 20 })
