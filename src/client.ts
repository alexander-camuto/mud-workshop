import { createWalletClient, http, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chain } from "./chain";

export const client = createWalletClient({
  chain,
  transport: webSocket(),
  account: privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  ),
});
