import {
  Account,
  Chain,
  Transport,
  WalletClient,
  createWalletClient,
  http,
  publicActions,
} from "viem";
import { account } from "./account";
import { transactionQueue } from "@latticexyz/common/actions";
import { getChains } from "./chain";

function extendWithPublicActions(
  client: WalletClient<Transport, Chain, Account>,
) {
  return client.extend(publicActions).extend(transactionQueue());
}

export type ExtendedClient = ReturnType<typeof extendWithPublicActions>;

let clients: [ExtendedClient, ExtendedClient];

export async function getClients(): Promise<[ExtendedClient, ExtendedClient]> {
  if (!clients) {
    const chains = await getChains();
    const client1 = createWalletClient({
      chain: chains[0],
      transport: http(),
      pollingInterval: 10,
      account,
    });

    const client2 = createWalletClient({
      chain: chains[1],
      transport: http(),
      pollingInterval: 10,
      account,
    });
    clients = [
      extendWithPublicActions(client1),
      extendWithPublicActions(client2),
    ] as const;
  }

  return clients;
}
