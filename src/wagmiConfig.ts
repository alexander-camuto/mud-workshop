import { Chain, http, webSocket } from "viem";
import { anvil } from "viem/chains";
import { createWagmiConfig } from "@latticexyz/entrykit/internal";
import { rhodolite, garnet, redstone } from "@latticexyz/common/chains";
import { chainId } from "./common";

const chains = [
  redstone,
  garnet,
  rhodolite,
  {
    ...anvil,
    contracts: {
      ...anvil.contracts,
      // TODO: make optional in entrykit?
      quarryPaymaster: {
        address: "0x8D8b6b8414E1e3DcfD4168561b9be6bD3bF6eC4B",
      },
    },
    blockExplorers: {
      default: {} as never,
      worldsExplorer: {
        name: "MUD Worlds Explorer",
        url: "https://explorer.mud.dev/rhodolite/worlds",
      },
    },
  },
] as const satisfies Chain[];

const transports = {
  [anvil.id]: webSocket(),
  [garnet.id]: http(),
  [rhodolite.id]: http(),
  [redstone.id]: http(),
} as const;

export const wagmiConfig = createWagmiConfig({
  chainId,
  walletConnectProjectId: "14ce88fdbc0f9c294e26ec9b4d848e44",
  appName: document.title,
  chains,
  transports,
  pollingInterval: {
    [anvil.id]: 2000,
    [garnet.id]: 2000,
    [rhodolite.id]: 2000,
    [redstone.id]: 2000,
  },
});
