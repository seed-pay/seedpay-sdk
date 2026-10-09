import { Big } from 'big.js'
import { joinURL, withQuery } from 'ufo'
import { http } from 'viem'
import { isHex } from 'viem/utils'

import { ASSETS, ChainEnum } from '../assets'
import { DESTINATION_ADDRESSES } from '../configs'
import { BPS, EVM_GAS_BUDGET, EVM_MESSAGE_LENGTH_BYTES, MIN_SLIPPAGE_BPS } from '../constants'
import { logger } from '../logger'
import { decodeAbi } from '../sdk/abi'
import { verifyIntent } from '../sdk/intent'

import type { HttpTransport } from 'viem'
import type { AssetId, Deposit, DepositParams, DepositStatus, Quote, QuoteParams } from '../types'
import type { DepositDetails, Environment, OpenDepositDetails, QuoteDetails } from './chainflip.types'

const CHAINFLIP_CHAINS: Record<ChainEnum, string> = {
  [ChainEnum.BTC]: 'Bitcoin',
  [ChainEnum.ETH]: 'Ethereum',
  [ChainEnum.ARB]: 'Arbitrum',
  [ChainEnum.SOL]: 'Solana',
  [ChainEnum.TRX]: 'Tron',
  [ChainEnum.DOT]: 'Assethub',
}

const CHAINS_MAP: Record<string, string> = {
  Bitcoin: 'BTC',
  Ethereum: 'ETH',
  Arbitrum: 'ARB',
  Solana: 'SOL',
  Tron: 'TRX',
  Assethub: 'DOT',
}

const mapChainflipAsset = (asset: AssetId) => ({
  chain: CHAINFLIP_CHAINS[ASSETS[asset].chain],
  asset: ASSETS[asset].symbol,
})

export class Chainflip {
  #api: string
  #rpc: HttpTransport

  #limitsCache: Record<string, string> | null = null
  #limitsPending: Promise<Record<string, string>> | null = null

  private constructor(rpc: string, api: string) {
    this.#rpc = http(rpc)
    this.#api = api
  }

  static init(rpc: string, api: string) {
    return new Chainflip(rpc, api)
  }

  async getQuote(request: QuoteParams, srcAmount?: string | null): Promise<Quote> {
    logger.time('CHAINFLIP:QUOTE')
    const log = []

    const limits = await this.#fetchLimits()

    let quote!: Quote
    let amount = srcAmount ?? limits[request.srcAsset] ?? '0'
    let targetBPS = new Big(request.amount).mul(BPS)

    for (let i = 0; i < 15; i++) {
      quote = await this.#fetchQuote({ ...request, amount })
      if (new Big(quote.destAmount).eq(0)) break

      log.push(quote)

      const minimum = targetBPS.div(BPS.minus(quote.slippage)).round(0, 3)
      const maximum = minimum.mul(BPS.plus(15)).div(BPS).round(0, 3)

      if (i === 0 && minimum.lte(quote.destAmount)) break
      if (minimum.lte(quote.destAmount) && maximum.gt(quote.destAmount)) break

      amount = minimum.mul(quote.srcAmount).div(quote.destAmount).round(0, 3).toString()
    }

    logger.table(log)
    logger.timeEnd('CHAINFLIP:QUOTE')
    return quote
  }

  async getDeposit(ref: string): Promise<Deposit> {
    const url = joinURL(this.#api, `/v2/swaps/${ref}`)
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`deposit: ${res.status}`)
        return res.json() as Promise<DepositDetails>
      })
      .then(
        ({
          depositChannel,
          fillOrKillParams,
          srcAsset,
          srcChain,
          state,
          deposit,
          swapEgress,
          ccmParams,
          refundEgress,
        }: DepositDetails) => {
          const message = ccmParams?.message
          if (!message || !isHex(message)) throw new Error('INVALID_INTENT')
          const intent = decodeAbi(message)
          if (!verifyIntent(intent)) throw new Error('INVALID_INTENT')

          const _srcAsset = `${CHAINS_MAP[srcChain]}.${srcAsset}` as AssetId
          const expireAt = depositChannel.createdAt + 3600 * 1000

          if (state === 'WAITING' && expireAt <= Date.now()) {
            state = 'EXPIRED'
          }

          return {
            ref,
            srcAsset: _srcAsset,
            srcAmount: depositChannel.expectedDepositAmount,
            depositAddress: depositChannel.depositAddress,
            depositAmount: deposit?.amount,
            depositTx: deposit?.txRef,
            destTx: swapEgress?.txRef,
            refundAddress: fillOrKillParams.refundAddress,
            refundAmount: refundEgress?.amount,
            refundTx: refundEgress?.txRef,
            status: state as DepositStatus,
            completedAt: swapEgress?.witnessedAt,
            expireAt,
            intent,
          }
        }
      )
  }

  async openDeposit(params: DepositParams, message: string): Promise<string> {
    const url = joinURL(this.#api, '/api/openSwapDepositChannel')
    const srcAsset = ASSETS[params.quote.srcAsset]
    const destAsset = ASSETS[params.quote.destAsset]
    const payload = {
      ccmParams: { message, gasBudget: String(EVM_GAS_BUDGET) },
      srcAsset: { chain: CHAINFLIP_CHAINS[srcAsset.chain], asset: srcAsset.symbol },
      destAsset: { chain: CHAINFLIP_CHAINS[destAsset.chain], asset: destAsset.symbol },
      destAddress: DESTINATION_ADDRESSES[params.intent.asset],
      amount: params.quote.srcAmount,
      quote: params.quote.quote,
      fillOrKillParams: {
        retryDurationBlocks: params.quote.quote.recommendedRetryDurationMinutes * 10,
        maxOraclePriceSlippage: params.quote.quote.recommendedLivePriceSlippageTolerancePercent * 100,
        minPriceX128: params.quote.minPriceX128,
        refundAddress: params.refundAddress,
      },
      //  Boost fee if awailable
      ...(params.quote.quote.maxBoostFeeBps ? { maxBoostFeeBps: params.quote.quote.maxBoostFeeBps } : {}),
    }
    return fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      method: 'POST',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`deposit: ${res.status}`)
        return res.json() as Promise<OpenDepositDetails>
      })
      .then(({ id }) => id)
  }

  async #fetchQuote(params: QuoteParams): Promise<Quote> {
    const { amount } = params
    const { asset: srcAsset, chain: srcChain } = mapChainflipAsset(params.srcAsset)
    const { asset: destAsset, chain: destChain } = mapChainflipAsset(params.destAsset)

    const req = {
      srcAsset,
      destAsset,
      srcChain,
      destChain,
      ccmGasBudget: String(EVM_GAS_BUDGET),
      ccmMessageLengthBytes: EVM_MESSAGE_LENGTH_BYTES,
      amount,
    }

    const url = withQuery(joinURL(this.#api, '/v2/quote'), req)
    const res = await fetch(url)
    const data = (await res.json()) as QuoteDetails[]
    const item = data?.at(0)

    if (!item) throw new Error('QUOTE_FAILED')

    const candidate = item?.boostQuote ?? item
    const { egressAmount, recommendedSlippageTolerancePercent } = candidate

    const slippageBps = new Big(recommendedSlippageTolerancePercent).mul(100).round(0, 3)
    const slippage = (slippageBps.gt(MIN_SLIPPAGE_BPS) ? slippageBps : MIN_SLIPPAGE_BPS).toString()
    const destAmount = egressAmount
    const srcAmount = amount
    const quote = {
      srcAsset: params.srcAsset,
      destAsset: params.destAsset,
      quote: candidate,
      srcAmount,
      destAmount,
      slippage,
    }
    const { minPriceX128 } = this.#computeMinPriceX128(quote)
    return { ...quote, minPriceX128 }
  }

  #computeMinPriceX128(quote: Omit<Quote, 'destMinAmount' | 'minPriceX128'>) {
    const srcDecimals = ASSETS[quote.srcAsset].decimals
    const destDecimals = ASSETS[quote.destAsset].decimals
    const minPrice = new Big(quote.quote.estimatedPrice).mul(BPS.minus(quote.slippage)).div(BPS)
    const minPriceX128 = minPrice
      .mul(new Big(2).pow(128))
      .mul(new Big(10).pow(destDecimals - srcDecimals))
      .toFixed(0)
      .toString()
    return { minPriceX128 }
  }

  #fetchLimits(): Promise<Record<string, string>> {
    if (this.#limitsCache) return Promise.resolve(this.#limitsCache)
    if (this.#limitsPending) return this.#limitsPending

    this.#limitsPending = (async () => {
      try {
        const { request } = this.#rpc({})
        const {
          ingress_egress: { minimum_deposit_amounts: amounts },
        }: Environment = await request({ method: 'cf_environment' })

        const limits: Record<string, string> = {}
        for (const name in amounts) {
          const chain = CHAINS_MAP[name as keyof typeof CHAINS_MAP]
          if (!chain) continue
          const assets = amounts[name]
          for (const symbol in assets) {
            const amount = assets[symbol]
            if (amount == null) continue
            limits[`${chain}.${symbol}`] = String(BigInt(amount))
          }
        }

        this.#limitsCache = limits
        return limits
      } finally {
        this.#limitsPending = null
      }
    })()

    return this.#limitsPending
  }
}
