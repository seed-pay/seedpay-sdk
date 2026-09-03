import { joinURL, withQuery } from 'ufo'
import { validate } from 'uuid'
import { fromHex, toHex } from 'viem/utils'

import { Chainflip } from '../providers'
import { mapToPayment } from '../utils'
import { encodeAbi } from './abi'

import { DEFAULT_CHAINFLIP_API, DEFAULT_CHAINFLIP_RPC, DEFAULT_SEED_API } from '../configs'

import type { Deposit, DepositParams, Payment, Quote, QuoteParams, Settlement } from '../types'

type SeedpayConfig = {
  chainflipRpc?: string
  chainflipApi?: string
  seedApi?: string
}

export class SeedpayApi {
  #chainflip: Chainflip
  #api: string

  private constructor({
    chainflipRpc = DEFAULT_CHAINFLIP_RPC,
    chainflipApi = DEFAULT_CHAINFLIP_API,
    seedApi = DEFAULT_SEED_API,
  }: SeedpayConfig) {
    this.#chainflip = Chainflip.init(chainflipRpc, chainflipApi)
    this.#api = seedApi
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

  async getPayment(id: string): Promise<Payment | null> {
    try {
      if (!validate(id)) return null
      const url = withQuery(joinURL(this.#api, 'settlements'), { id: `eq.${id}` })
      const response = await fetch(url)
      if (!response.ok) return null
      const settlements = (await response.json()) as Settlement[]
      return mapToPayment(settlements)
    } catch {
      return null
    }
  }
}
