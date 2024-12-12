import { syncToStash } from "@latticexyz/store-sync/internal";
import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { stash1, stash2 } from "./stash";
import { Props, StashSyncContext } from "./StashSyncProvider";
import { getClients } from "../client";

export function StashSyncProvider({ address, startBlock, children }: Props) {
  const existingValue = useContext(StashSyncContext);
  if (existingValue != null) {
    throw new Error("A `StashSyncProvider` cannot be nested inside another.");
  }

  const { data: sync, error: syncError } = useQuery({
    queryKey: ["syncToStash", address, startBlock?.toString()],
    queryFn: async () => {
      const clients = await getClients();
      if (!clients) {
        throw new Error("Missing client");
      }

      // TODO: clear stash
      const sync1 = await syncToStash({
        stash: stash1,
        publicClient: clients[0] as any,
        address,
        startBlock,
      });
      const sync2 = await syncToStash({
        stash: stash2,
        publicClient: clients[1] as any,
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
