import { useSync } from "./mud/useSync";
import { useQuery } from "@tanstack/react-query";
import { ExtendedClient } from "./client";
import { getWorld } from "./contract";

export function useWorldContract(clients?: [ExtendedClient, ExtendedClient]) {
  const sync = useSync();

  const { data: worldContract1 } = useQuery({
    queryKey: ["worldContract", clients?.[0]?.uid],
    queryFn: () => {
      if (!clients?.[0]) {
        throw new Error("Not connected.");
      }

      return getWorld(clients[0]);
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!clients,
  });

  const { data: worldContract2 } = useQuery({
    queryKey: ["worldContract", clients?.[1]?.uid],
    queryFn: () => {
      if (!clients?.[1]) {
        throw new Error("Not connected.");
      }

      return getWorld(clients[1]);
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !!clients,
  });

  const waitForTransaction1 = sync[0]?.waitForTransaction;
  const waitForTransaction2 = sync[1]?.waitForTransaction;

  return worldContract1 &&
    waitForTransaction1 &&
    worldContract2 &&
    waitForTransaction2
    ? ([
        {
          worldContract: worldContract1,
          waitForTransaction: waitForTransaction1,
        },
        {
          worldContract: worldContract2,
          waitForTransaction: waitForTransaction2,
        },
      ] as const)
    : undefined;
}
