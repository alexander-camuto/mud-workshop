import { createWalletClient, http, publicActions } from "viem";
import { chains } from "./chain";
import { account } from "./account";

export const client1 = createWalletClient({
  chain: chains[0],
  transport: http(),
  pollingInterval: 10,
  account,
});

export const client2 = createWalletClient({
  chain: chains[1],
  transport: http(),
  pollingInterval: 10,
  account,
});

export const clients = [
  client1.extend(publicActions),
  client2.extend(publicActions),
] as const;
