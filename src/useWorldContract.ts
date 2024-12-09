import { worldAbi } from "./common";
import { getContract } from "viem";
import { useSync } from "./mud/useSync";
import { useQuery } from "@tanstack/react-query";
import { client } from "./client";
import { world } from "./contract";

export function useWorldContract() {
  const { waitForTransaction } = useSync();

  const { data: worldContract } = useQuery({
    queryKey: ["worldContract", world.address, client?.uid],
    queryFn: () => {
      if (!client) {
        throw new Error("Not connected.");
      }

      return getContract({
        abi: worldAbi,
        address: world.address,
        client: {
          public: client,
          wallet: client,
        },
      });
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return worldContract && waitForTransaction
    ? {
        worldContract,
        waitForTransaction,
      }
    : {};
}
