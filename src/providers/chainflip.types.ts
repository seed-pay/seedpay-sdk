export type QuoteDetails = {
  egressAmount: string
  recommendedSlippageTolerancePercent: number
  estimatedPrice: string
  maxBoostFeeBps?: number
  boostQuote?: QuoteDetails
}

export type DepositDetails = {
  depositChannel: {
    depositAddress: string
    expectedDepositAmount: string
    createdAt: number
  }
  fillOrKillParams: { refundAddress: string }
  srcAsset: string
  srcChain: string
  state: string
  deposit?: { amount: string; txRef?: string }
  swapEgress?: { txRef?: string; witnessedAt?: number }
  refundEgress?: { amount: string; txRef?: string }
  ccmParams?: { message?: string }
}

export type OpenDepositDetails = {
  id: string
}

export type Environment = {
  ingress_egress: {
    minimum_deposit_amounts: Record<string, Record<string, string>>
  }
}
