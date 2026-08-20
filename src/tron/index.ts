import { base58_to_binary } from 'base58-js'
import { hexToBytes, sha256 } from 'viem'

const ADDRESS_PREFIX_BYTE = 0x41
const ADDRESS_SIZE = 34

function SHA256(bytes: Uint8Array): Uint8Array {
  return hexToBytes(sha256(bytes))
}

export function isAddress(base58Str: string): boolean {
  try {
    if (base58Str.length !== ADDRESS_SIZE) return false

    const address = base58_to_binary(base58Str)

    if (address.length !== 25) return false
    if (address[0] !== ADDRESS_PREFIX_BYTE) return false

    const body = address.slice(0, 21)
    const checksum = address.slice(21)

    const hash = SHA256(SHA256(body))

    return checksum[0] === hash[0] && checksum[1] === hash[1] && checksum[2] === hash[2] && checksum[3] === hash[3]
  } catch {
    return false
  }
}
