import { defineChain } from "viem";

// Get RPC URLs and assume fixed chain ids (we could get chain ids with the client but we need this quickly)
const CHAIN1_RPC_URL = import.meta.env.VITE_RPC_URL_1;
const CHAIN2_RPC_URL = import.meta.env.VITE_RPC_URL_2;

const OPChain1 = defineChain({
  id: 901,
  name: "OPChainA",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [CHAIN1_RPC_URL],
    },
  },
  fees: {
    defaultPriorityFee: 0n,
  },
});

const OPChain2 = defineChain({
  id: 902,
  name: "OPChainB",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [CHAIN2_RPC_URL],
    },
  },
  fees: {
    defaultPriorityFee: 0n,
  },
});

export const chains = [OPChain1, OPChain2] as const;
