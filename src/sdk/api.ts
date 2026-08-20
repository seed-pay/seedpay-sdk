import { fallback, http } from 'viem'
import { arbitrum } from 'viem/chains'
import { decodeEventLog, formatUnits, fromHex, getAddress, isAddressEqual, isHash, toHex } from 'viem/utils'
import { hexToBytes } from 'viem'
import { stringify as stringifyUuid } from 'uuid'

import { ASSETS, DESTINATION_ASSETS } from '../assets'
import { DEFAULT_ARB_RPC, DEFAULT_CHAINFLIP_API, DEFAULT_CHAINFLIP_RPC, DESTINATION_ADDRESSES } from '../configs'
import { RESULT_STATUS } from '../constants'
import { Chainflip } from '../providers'
import { encodeAbi } from './abi'
import { ProcessedEvent } from './contract'
import { verifyIntent } from './intent'

import type { Address, FallbackTransport, TransactionReceipt } from 'viem'
import type { Deposit, DepositParams, Intent, Quote, QuoteParams, Result, Verification } from '../types'

type SeedpayConfig = {
  chainflipRpc?: string
  chainflipApi?: string
  arbRpc?: string
}

export class SeedpayApi {
  #chainflip: Chainflip
  #rpc: FallbackTransport

  private constructor({
    arbRpc = DEFAULT_ARB_RPC,
    chainflipRpc = DEFAULT_CHAINFLIP_RPC,
    chainflipApi = DEFAULT_CHAINFLIP_API,
  }: SeedpayConfig) {
    this.#chainflip = Chainflip.init(chainflipRpc, chainflipApi)
    this.#rpc = fallback([http(arbRpc), http()])
  }

  static init(config?: SeedpayConfig) {
    return new SeedpayApi(config ?? {})
  }

  async getQuote(params: QuoteParams, srcAmount?: string | null): Promise<Quote> {
    return await this.#chainflip.getQuote(params, srcAmount)
  }

  async openDeposit(params: DepositParams): Promise<string> {
    const { intent, quote } = params
    const message = encodeAbi(intent)
    const finalQuote = await this.#chainflip.getQuote({ ...quote, amount: intent.amount }, quote.srcAmount)
    const ref = await this.#chainflip.openDeposit({ ...params, quote: finalQuote }, message)
    return toHex(ref).slice(2)
  }

  async getDeposit(id: string): Promise<Deposit> {
    return this.#chainflip.getDeposit(fromHex(`0x${id}`, 'string'))
  }

  async verifyTx(txHash: string, recipientAddress: Address): Promise<Verification | null> {
    if (!isHash(txHash)) return null
    const { request } = this.#rpc({ chain: arbitrum })
    const receipt: TransactionReceipt = await request({ method: 'eth_getTransactionReceipt', params: [txHash] })
    const destAddress = DESTINATION_ADDRESSES['ARB.USDC'] as Address

    const log = receipt.logs.find(({ address }) => isAddressEqual(address, destAddress))
    if (!log) return null
    const event = decodeEventLog({ abi: [ProcessedEvent], data: log.data, topics: log.topics })

    const { status, recipientAmount, recipient, affiliate, id: idHex, intentAmount, token } = event.args
    const asset = DESTINATION_ASSETS.find((assetId) => isAddressEqual(ASSETS[assetId].address, token))

    if (!asset) return null
    if (!RESULT_STATUS[status]) return null
    if (!isAddressEqual(recipient, recipientAddress)) return null

    const id = stringifyUuid(hexToBytes(idHex))
    const assetMeta = ASSETS[asset]
    const amount = formatUnits(intentAmount, assetMeta.decimals)
    const intent: Intent = { id, asset, recipient: getAddress(recipient), affiliate: getAddress(affiliate), amount }

    if (!verifyIntent(intent)) return null

    const result: Result = {
      amount: formatUnits(recipientAmount, assetMeta.decimals),
      rawAmount: String(recipientAmount),
      status: RESULT_STATUS[status],
    }

    return { tx: txHash, intent, result }
  }
}
