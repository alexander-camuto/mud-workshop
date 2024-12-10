import { defineChain } from "viem";

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
      http: ["http://127.0.0.1:9545"],
      webSocket: ["ws://127.0.0.1:9545"],
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
      http: ["http://127.0.0.1:9546"],
      webSocket: ["ws://127.0.0.1:9546"],
    },
  },
  fees: {
    defaultPriorityFee: 0n,
  },
});

export const chains = [OPChain1, OPChain2] as const;
