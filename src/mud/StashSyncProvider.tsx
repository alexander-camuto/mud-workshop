import {
  syncToStash,
  SyncToStashResult,
} from "@latticexyz/store-sync/internal";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { Address, publicActions, PublicClient } from "viem";
import { useQuery } from "@tanstack/react-query";
import { clients } from "../client";
import { stash1, stash2 } from "./stash";

/** @internal */
export const StashSyncContext = createContext<{
  sync?: SyncToStashResult[];
} | null>(null);

export type Props = {
  address: Address;
  startBlock?: bigint;
  children: ReactNode;
};

export function StashSyncProvider({ address, startBlock, children }: Props) {
  const existingValue = useContext(StashSyncContext);
  if (existingValue != null) {
    throw new Error("A `StashSyncProvider` cannot be nested inside another.");
  }

  const { data: sync, error: syncError } = useQuery({
    queryKey: ["syncToStash", address, startBlock?.toString()],
    queryFn: async () => {
      const [client1, client2] = clients;
      if (!client1 || !client2) {
        throw new Error("Missing client");
      }

      // TODO: clear stash
      const sync1 = await syncToStash({
        stash: stash1,
        publicClient: client1.extend(publicActions) as PublicClient,
        address,
        startBlock,
      });
      const sync2 = await syncToStash({
        stash: stash2,
        publicClient: client2.extend(publicActions) as PublicClient,
        address,
        startBlock,
      });

      return [sync1, sync2];
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  if (syncError) throw syncError;

  useEffect(() => {
    const [sync1, sync2] = sync || [undefined, undefined];
    const sub1 = sync1?.storedBlockLogs$.subscribe({
      error: (error) => console.error("got sync error", error),
    });

    const sub2 = sync2?.storedBlockLogs$.subscribe({
      error: (error) => console.error("got sync error", error),
    });

    return () => {
      sync1?.stopSync();
      sub1?.unsubscribe();
      sync2?.stopSync();
      sub2?.unsubscribe();
    };
  }, [sync]);

  return (
    <StashSyncContext.Provider value={{ sync }}>
      {children}
    </StashSyncContext.Provider>
  );
}
