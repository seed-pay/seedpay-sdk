import { ethAddress } from 'viem'

import { keys } from './utils'

export enum ChainEnum {
  BTC = 1,
  ETH = 2,
  ARB = 3,
  SOL = 4,
  TRX = 5,
  DOT = 6,
}

export const ASSETS = {
  'BTC.BTC': {
    chain: ChainEnum.BTC,
    decimals: 8,
    symbol: 'BTC',
    name: 'Bitcoin',
    address: ethAddress,
    standard: 'native',
  },
  'TRX.USDT': {
    chain: ChainEnum.TRX,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    standard: 'trc20',
  },
  'ETH.USDT': {
    chain: ChainEnum.ETH,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    standard: 'erc20',
  },
  'ETH.USDC': {
    chain: ChainEnum.ETH,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    standard: 'erc20',
  },
  'ETH.ETH': {
    chain: ChainEnum.ETH,
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum',
    address: ethAddress,
    standard: 'native',
  },
  'ETH.WBTC': {
    chain: ChainEnum.ETH,
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    standard: 'erc20',
  },
  'SOL.USDT': {
    chain: ChainEnum.SOL,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether',
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    standard: 'spl',
  },
  'SOL.USDC': {
    chain: ChainEnum.SOL,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    standard: 'spl',
  },
  'TRX.TRX': {
    chain: ChainEnum.TRX,
    decimals: 6,
    symbol: 'TRX',
    name: 'Tron',
    address: ethAddress,
    standard: 'native',
  },
  'SOL.SOL': {
    chain: ChainEnum.SOL,
    decimals: 9,
    symbol: 'SOL',
    name: 'Solana',
    address: ethAddress,
    standard: 'native',
  },
  'ARB.USDT': {
    chain: ChainEnum.ARB,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether',
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    standard: 'erc20',
  },
  'ARB.USDC': {
    chain: ChainEnum.ARB,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    standard: 'erc20',
  },
  'ARB.ETH': {
    chain: ChainEnum.ARB,
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum',
    address: ethAddress,
    standard: 'native',
  },
  'DOT.USDT': {
    chain: ChainEnum.DOT,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether',
    address: '1984',
    standard: 'pallet-asset',
  },
  'DOT.USDC': {
    chain: ChainEnum.DOT,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    address: '1337',
    standard: 'pallet-asset',
  },
  'DOT.DOT': {
    chain: ChainEnum.DOT,
    decimals: 10,
    symbol: 'DOT',
    name: 'Polkadot',
    address: ethAddress,
    standard: 'native',
  },
} as const

export const DESTINATION_ASSETS = ['ARB.USDC', 'ARB.USDT', 'ARB.ETH'] as const

export const ASSET_LIST = keys(ASSETS)
