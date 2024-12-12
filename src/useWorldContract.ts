import { useClient, useAccount } from "wagmi";
import { chainId, worldAbi } from "./common";
import { getContract, Address } from "viem";
import { deployContract } from "viem/actions";
import { useSync } from "./mud/useSync";
import { useQuery } from "@tanstack/react-query";
import {
  useSessionClient,
  useEntryKitConfig,
} from "@latticexyz/entrykit/internal";
import { observer } from "@latticexyz/explorer/observer";
import npcContract from "../out/NPC.sol/NPC.json";

export function useWorldContract() {
  const { worldAddress } = useEntryKitConfig();
  const { waitForTransaction } = useSync();
  const client = useClient({ chainId });
  const { data: sessionClient } = useSessionClient();
  const account = useAccount();

  const deployNPC = async (target: Address) => {
    const args = {
      abi: npcContract.abi,
      account: account.address,
      args: [worldAddress, "0x75afe612b0b6963f407aaBFbBc1096c1587456d9", target],
      bytecode: npcContract.bytecode.object,
    };
    console.log(args);
    const hash = await deployContract(sessionClient, args);
  }

  const { data: worldContract } = useQuery({
    queryKey: ["worldContract", worldAddress, client?.uid, sessionClient?.uid],
    queryFn: () => {
      if (!client || !sessionClient) {
        throw new Error("Not connected.");
      }

      return getContract({
        abi: worldAbi,
        address: worldAddress,
        client: {
          public: client,
          wallet: sessionClient.extend(observer()),
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
	deployNPC,
      }
    : {};
}
