import { Jupiter, TOKEN_LIST_URL } from "@jup-ag/core";
import { PublicKey } from "@solana/web3.js";
import {
  getTokenAccountAddress,
  ownerTokenAccounts,
  ownerTokenBalances,
  updateTokenBalances,
} from "../accounts";
import { getTokenPrice } from "../coingecko";

import { connection, keypair } from "../connection";
import { TOKENS, TokenInfo } from "../constants";
import { logger } from "../logger";
import { transferToken } from "../utils/transferToken";

interface SwapArgs {
  from: string;
  to: string;
  amount: number;
  transferAddress?: string;
  transferThreshold?: string;
  priceThreshold?: string;
  slippage?: number;
  routeCacheMs?: number;
}


const transferTokenAccounts: Record<string, PublicKey> = {};

export async function swapCommand(
  args: SwapArgs,
  jupiter: Jupiter,
  fromToken: TokenInfo,
  toToken: TokenInfo,
): Promise<string> {

  if (!fromToken) {
    throw new Error(`token ${args.from} not found in TOKENS config`);
  }

  if (!toToken) {
    throw new Error(`token ${args.to} not found in TOKENS config`);
  }

  await updateTokenBalances();

  const transferThreshold =
    Number(args.transferThreshold ?? 0) * 10 ** toToken.decimals;
  const priceThreshold = Number(args.priceThreshold ?? 0);
  const fromTokenAccount = ownerTokenAccounts[fromToken.mint];
  const toTokenAccount = ownerTokenAccounts[toToken.mint];
  const fromBalance =
    fromTokenAccount && ownerTokenBalances[fromTokenAccount.toBase58()];
  const toBalance =
    toTokenAccount && ownerTokenBalances[toTokenAccount.toBase58()];

  const swapAmount = args.amount * 10 ** fromToken.decimals;

  if (Number.isNaN(swapAmount) || swapAmount <= 0) {
    throw new Error(`swap amount not valid ${args.amount}`);
  }

  // Check from balance
  if (!fromBalance || fromBalance < swapAmount) {
    throw new Error(
      `from balance not enough for swap, need ${swapAmount} ${fromToken.symbol} only have ${fromBalance} ${fromToken.symbol}`
    );
  }
  const routeMap = jupiter.getRouteMap();
  //const possiblePairs = routeMap.get(fromToken.mint);
  //if (!possiblePairs?.filter((i) => i === toToken.mint).length) {
  //  throw new Error(`could not find route map for ${args.from}-${args.to}`);
  //}

  // Calculate routes for swapping [amount] [from] to [to] with 2% slippage
  // routes are sorted based on outputAmount, so ideally the first route is the best.
  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(fromToken.mint),
    outputMint: new PublicKey(toToken.mint),
    inputAmount: swapAmount,
    onlyDirectRoutes: true,
    slippage: args.slippage ?? 3,
  });



  if (!routes?.routesInfos?.length) {
    throw new Error(`could not find route for ${args.from}-${args.to}`);
  }

  // Prepare execute exchange
  const { execute } = await jupiter.exchange({
    routeInfo: routes.routesInfos[0],
  });

  // Swap execute
  const swapResult: any = await execute();

  if (swapResult.error) {
    throw new Error(`swap result error: ${swapResult}`);
  }
  // Check transfer balance
  if (
    toBalance &&
    toTokenAccount &&
    args.transferAddress &&
    transferThreshold > 0 &&
    toBalance > transferThreshold
  ) {
    let transferTokenAccount = transferTokenAccounts[toToken.mint];
    if (!transferTokenAccount) {
      transferTokenAccount = await getTokenAccountAddress(
        new PublicKey(args.transferAddress),
        new PublicKey(toToken.mint)
      );
      transferTokenAccounts[toToken.mint] = transferTokenAccount;
    }
    logger.info(
      `transfer threshold reached, transferring ${toToken.symbol
      } (${toBalance}) to ${transferTokenAccount.toBase58()}`
    );
    try {
      const res = await transferToken(
        toTokenAccount,
        transferTokenAccount,
        toBalance
      );
      logger.info(`transfer balance success: ${res.txId}`);
    } catch (error) {
      logger.error(`transfer balance error: ${error}`);
    }
  }
  return swapResult.txid;
}
