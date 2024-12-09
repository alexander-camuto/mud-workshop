import { createWalletClient, http } from "viem";
import { chains } from "./chain";
import { account } from "./account";

export const client1 = createWalletClient({
  chain: chains[0],
  transport: http(),
  account,
});

export const client2 = createWalletClient({
  chain: chains[1],
  transport: http(),
  account,
});

export const clients = [client1, client2] as const;
