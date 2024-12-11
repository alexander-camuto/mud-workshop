import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { stash1, stash2 } from "./mud/stash";
import { abi, Direction, enums, mapSize } from "./common";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";
import { clients } from "./client";
import { parseEventLogs } from "viem";
import { relay } from "./relay";
import { usePlayers } from "./usePlayers";
import { Explorer } from "./Explorer";

const explorerUrls = [
  import.meta.env.VITE_EXPLORER_URL_1,
  import.meta.env.VITE_EXPLORER_URL2,
];

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players1 = usePlayers(stash1);
  const players2 = usePlayers(stash2);

  const players = useMemo(
    () => [
      ...players1.map((player) => ({ ...player, chainId: 901 })),
      ...players2.map((player) => ({ ...player, chainId: 902 })),
    ],
    [players1, players2],
  );

  const worldContracts = useWorldContract();

  const currentPlayer = players
    .filter(
      (player) =>
        player.player.toLowerCase() === account.address?.toLowerCase(),
    )
    .sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0))
    .at(0);

  const onMove = useMemo(
    () => async (direction: Direction) => {
      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      const isBridging = currentPlayer && !currentPlayer.owned;

      if (isBridging) {
        console.warn("Can't move while bridging");
        return;
        // chainId = currentPlayer.chainId === 901 ? 902 : 901;
      }

      let chainId: number;
      if (!currentPlayer || currentPlayer.x < mapSize / 2) {
        chainId = 901;
      } else {
        chainId = 902;
      }

      const [world, client] =
        chainId === 901
          ? [worldContracts[0], clients[0]]
          : [worldContracts[1], clients[1]];

      try {
        const directionIndex = enums.Direction.indexOf(direction);
        await world.worldContract.simulate.app__move([directionIndex]);
        const hash = await world.worldContract.write.app__move([
          directionIndex,
        ]);

        // await world.waitForTransaction(hash);

        let receipt;
        while (true) {
          receipt = await client.getTransactionReceipt({ hash });

          if (receipt) break;

          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        // const receipt = await client.waitForTransactionReceipt({ hash });

        const logs = parseEventLogs({
          abi,
          eventName: "World_CrosschainRecord",
          logs: receipt.logs,
        });

        if (logs.length > 0) {
          await Promise.all(logs.map((log) => relay(client, log)));
        }
      } catch (e) {
        console.log(e instanceof Error ? e.message : String(e));
      }
    },
    [worldContracts, currentPlayer],
  );

  // Display owned players, or if there are two non-owned players, display the most recent one
  const playersToRender = useMemo(() => {
    const playersByAddress = new Map();

    for (const player of players) {
      const address = player.player.toLowerCase();
      const existing = playersByAddress.get(address);
      if (!existing || player.owned || player.timestamp > existing.timestamp) {
        playersByAddress.set(address, player);
      }
    }
    return Array.from(playersByAddress.values());
  }, [players]);

  return (
    <>
      {isLive ? (
        <>
          <GameMap players={playersToRender} onMove={onMove} />
          <div className="fixed bottom-0 inset-x-0 flex gap-2">
            <div className="flex-1">
              <Explorer url={explorerUrls[0]} />
            </div>
            <div className="flex-1">
              <Explorer url={explorerUrls[1]} />
            </div>
          </div>
        </>
      ) : (
        <div className="tabular-nums">
          {message} ({percentage.toFixed(1)}%)…
        </div>
      )}
    </>
  );
}
