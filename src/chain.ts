import { Chain, defineChain } from "viem";
import { getFastestRegion } from "./config";

function defineOPChain(id: number, rpc: string) {
  return defineChain({
    id,
    name: `OPChain${id}`,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [rpc],
      },
    },
    fees: {
      defaultPriorityFee: 0n,
    },
  });
}

let chains: [Chain, Chain];

// Get RPC URLs and assume fixed chain ids (we could get chain ids with the client but we need this quickly)
export async function getChains(): Promise<[Chain, Chain]> {
  if (!chains) {
    const region = await getFastestRegion();
    chains = [
      defineOPChain(901, region.rpcUrls[0]),
      defineOPChain(902, region.rpcUrls[1]),
    ] as const;
  }

  return chains;
}
