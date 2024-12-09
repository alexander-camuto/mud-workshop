import { Address } from "viem";

import { worlds } from "./contract";

export async function getWorldDeploy(): Promise<{
  address: Address;
  blockNumber: bigint | null;
}> {
  // TODO: figure out how to catch vite:import-analysis error when this file is missing
  if (!worlds[0] || !worlds[1] || worlds[0].address !== worlds[1].address) {
    throw new Error(`Invalid "worlds.json".`);
  }
  return {
    address: worlds[0].address,
    blockNumber: null,
  };
}
