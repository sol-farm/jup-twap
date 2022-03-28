import { Jupiter } from "@jup-ag/core";
import { TOKENS } from "../constants";
import { swapCommand } from "./swap";
import { connection, keypair } from "../connection";
describe("Swap some USDC for PRT", () => {
  it("should swap 0.1 USDC to PRT successfully", async () => {
    const txid = await swapCommand({
      from: "USDC",
      to: "PRT",
      amount: 0.1,
    }, await Jupiter.load({
      connection,
      cluster: "mainnet-beta",
      user: keypair,
      routeCacheDuration: 2000, // 2000ms (2s)
    }), TOKENS[0], TOKENS[1]);
    expect(txid).toBeDefined();
  });
});
