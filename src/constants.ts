export const ENV = {
  rpcURL: process.env.RPC_URL ?? "",
  walletPK: process.env.WALLET_PK ?? "",
};

export interface TokenInfo {
  name: string;
  mint: string;
  symbol: string;
  decimals: number;
  coinGeckoID?: string;
}

export const TOKENS: Record<string, TokenInfo> = {
  SOL: {
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    decimals: 9,
  },
  USDC: {
    name: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    decimals: 6,
  },
  USDT: {
    name: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDt",
    decimals: 6,
  },
  PRT: {
    name: "PRT",
    mint: "PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44",
    symbol: "PRT",
    decimals: 6,
    coinGeckoID: "parrot-protocol",
  },
  TULIP: {
    name: "Tulip Protocol",
    mint: "TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs",
    symbol: "TULIP",
    decimals: 6,
    coinGeckoID: "solfarm",
  }
};
