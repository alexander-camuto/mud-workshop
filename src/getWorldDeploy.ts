import { Address } from "viem";

import { getWorldAddress } from "./contract";

export async function getWorldDeploy(): Promise<{
  address: Address;
  blockNumber: bigint | null;
}> {
  return {
    address: getWorldAddress(),
    blockNumber: null,
  };
}
