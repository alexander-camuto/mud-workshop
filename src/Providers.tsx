import { ReactNode } from "react";
import { StashSyncProvider } from "./mud/StashSyncProvider.1";
import { Address } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export type Props = {
  worldDeploy: {
    address: Address;
    blockNumber: bigint | null;
  };
  children: ReactNode;
};

const queryClient = new QueryClient();

export function Providers({ worldDeploy, children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <StashSyncProvider
        address={worldDeploy.address}
        startBlock={worldDeploy.blockNumber || undefined}
      >
        {children}
      </StashSyncProvider>
    </QueryClientProvider>
  );
}
