import { useSync } from "./mud/useSync";
import { useQuery } from "@tanstack/react-query";
import { clients } from "./client";
import { getWorld } from "./contract";

export function useWorldContract() {
  const sync = useSync();

  const [client1, client2] = clients;
  const { data: worldContract1 } = useQuery({
    queryKey: ["worldContract", client1.uid],
    queryFn: () => {
      if (!client1) {
        throw new Error("Not connected.");
      }

      return getWorld(client1);
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { data: worldContract2 } = useQuery({
    queryKey: ["worldContract", client2.uid],
    queryFn: () => {
      if (!client2) {
        throw new Error("Not connected.");
      }

      return getWorld(client2);
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
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
