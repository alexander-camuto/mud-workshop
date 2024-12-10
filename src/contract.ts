import {
  Account,
  Address,
  Chain,
  Client,
  GetContractReturnType,
  Transport,
  WalletClient,
  getContract,
} from "viem";
import worlds from "../worlds.json";
import { abi } from "./common";

// quick hack to get the address, we should probably check that worlds match
export function getWorldAddress(): Address {
  const address = worlds["901"]?.address;
  if (!address) {
    throw new Error("Invalid world address");
  }
  return address;
}

type KeyedClient = {
  public: Client<Transport, Chain>;
  wallet: Client<Transport, Chain, Account>;
};

export function getWorld(
  client: WalletClient<Transport, Chain, Account>,
): GetContractReturnType<typeof abi, KeyedClient, Address> {
  const chainId = client.chain.id.toString();
  const worldConfig = worlds[chainId as keyof typeof worlds];

  if (!worldConfig?.address) {
    throw new Error(`World not found for chain ID ${chainId}`);
  }

  return getContract({
    abi,
    address: worldConfig.address,
    client: {
      public: client,
      wallet: client,
    },
  });
}
