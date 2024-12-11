import {
  Account,
  Chain,
  Transport,
  WalletClient,
  createWalletClient,
  http,
  publicActions,
} from "viem";
import { chains } from "./chain";
import { account } from "./account";
import { transactionQueue } from "@latticexyz/common/actions";

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

function extendWithPublicActions(
  client: WalletClient<Transport, Chain, Account>,
) {
  return client.extend(publicActions).extend(transactionQueue());
}

export type ExtendedClient = ReturnType<typeof extendWithPublicActions>;

export const clients = [
  extendWithPublicActions(client1),
  extendWithPublicActions(client2),
] as const;
