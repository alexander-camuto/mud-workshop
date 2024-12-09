import { worldAbi } from "./common";
import { getContract } from "viem";
import { useSync } from "./mud/useSync";
import { useQuery } from "@tanstack/react-query";
import { clients } from "./client";
import { worlds } from "./contract";

export function useWorldContract() {
  const sync = useSync();

  const [world1, world2] = worlds;
  const [client1, client2] = clients;
  const { data: worldContract1 } = useQuery({
    queryKey: ["worldContract", world1.address, client1.uid],
    queryFn: () => {
      if (!client1) {
        throw new Error("Not connected.");
      }

      return getContract({
        abi: worldAbi,
        address: world1.address,
        client: {
          public: client1,
          wallet: client1,
        },
      });
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { data: worldContract2 } = useQuery({
    queryKey: ["worldContract", world2.address, client2.uid],
    queryFn: () => {
      if (!client2) {
        throw new Error("Not connected.");
      }

      return getContract({
        abi: worldAbi,
        address: world2.address,
        client: {
          public: client2,
          wallet: client2,
        },
      });
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
    ? {
        worldContract1,
        waitForTransaction1,
        worldContract2,
        waitForTransaction2,
      }
    : {};
}
